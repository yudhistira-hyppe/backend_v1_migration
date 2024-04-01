import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { CreateUserbasicDto, mingrionRun } from './dto/create-userbasic.dto';
import { Userbasic, UserbasicDocument } from './schemas/userbasic.schema';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InterestsRepoService } from '../../infra/interests_repo/interests_repo.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { LogapisService } from '../logapis/logapis.service';
import { skip } from 'rxjs';
import { LogMigrationsService } from '../logmigrations/logmigrations.service';
import { LogMigrations } from '../logmigrations/schema/logmigrations.schema';

@Injectable()
export class UserbasicsService {
  constructor(
    @InjectModel(Userbasic.name, 'SERVER_FULL')
    private readonly userbasicModel: Model<UserbasicDocument>,
    private readonly languagesService: LanguagesService,
    private readonly interestsRepoService: InterestsRepoService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly mediaproofpictsService: MediaproofpictsService,
    private readonly logapiSS: LogapisService,
    private readonly logMigrationsService: LogMigrationsService,
  ) { }

  async create(CreateUserbasicDto: CreateUserbasicDto): Promise<Userbasic> {
    const createUserbasicDto = await this.userbasicModel.create(
      CreateUserbasicDto,
    );
    return createUserbasicDto;
  }

  async createV2(dto: Userbasic): Promise<Userbasic> {
    const ndto = await this.userbasicModel.create(dto);
    return ndto;
  }

  async updatebyEmail(email: string, data: Object) {
    console.log(data);
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      data,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  async updatebyEmailV2(email: string, dto: Userbasic) {
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      dto,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  async updateLanguage(email: string, language: string) {
    console.log(language);
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      {
        languages: {
          $ref: 'languages',
          $id: new Object(language),
          $db: 'hyppe_infra_db',
        }
      },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  async updatebyId(email: string,
    createUserbasicDto: CreateUserbasicDto,) {
    console.log(createUserbasicDto);
    this.userbasicModel.findByIdAndUpdate(
      {
        email: email,
      },
      createUserbasicDto,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }


  async getReward(name_akun: string, day_filter: { filter_7_day: boolean, filter_14_day: boolean, filter_1_month: boolean, filter_3_month: boolean, }, date_filter: any, gender: { male: boolean, female: boolean, other: boolean }, age: { show_smaller_than_8: boolean, show_8_smaller_than_23: boolean, show_24_smaller_than_39: boolean, show_greater_than_39: boolean }, areas: any[], page: number, limit: number, sorting: boolean) {
    var paramaggregate = [];
    var $match = {};
    //------------FILTER NAME------------
    if (name_akun != undefined) {
      $match["name"] = {
        $regex: name_akun,
        $options: "i"
      };
    }

    const query = await this.userbasicModel.aggregate([
      {
        $lookup: {
          from: "accountbalances",
          localField: "_id",
          foreignField: "iduser",
          as: "interests"
        }
      },
      // {
      //   $match: {
      //     type: "rewards",
      //     idtrans: { $ne: null },
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'userbasics',
      //     as: 'userbasics_data',
      //     let: {
      //       local_id: "$iduser"
      //     },
      //     pipeline: [
      //       {
      //         $match:
      //         {
      //           $expr: {
      //             $eq: ['$_id', '$$local_id']
      //           }
      //         }
      //       },
      //       {
      //         $project: {
      //           _id: 1,
      //           email: 1,
      //           fullName: 1,
      //           profileID: 1,
      //           gender: 1,
      //           age: {
      //             $cond: {
      //               if: {
      //                 $and: ['$dob', {
      //                   $ne: ["$dob", ""]
      //                 }]
      //               },
      //               then: {
      //                 $toInt: {
      //                   $divide: [{
      //                     $subtract: [new Date(), {
      //                       $toDate: "$dob"
      //                     }]
      //                   }, (365 * 24 * 60 * 60 * 1000)]
      //                 }
      //               },
      //               else: 0
      //             }
      //           },
      //           userInterests_array: {
      //             $map: {
      //               input: {
      //                 $map: {
      //                   input: "$userInterests",
      //                   in: {
      //                     $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
      //                   },
      //                 }
      //               },
      //               in: "$$this.v"
      //             }
      //           },
      //           states: 1,
      //           userAuth: 1,
      //         }
      //       },
      //       {
      //         $lookup: {
      //           from: "interests_repo",
      //           localField: "userInterests_array",
      //           foreignField: "_id",
      //           as: "interests"
      //         }
      //       },
      //       {
      //         $lookup: {
      //           from: 'areas',
      //           as: 'areas',
      //           let: {
      //             local_id: "$states.$id"
      //           },
      //           pipeline: [
      //             {
      //               $match:
      //               {
      //                 $expr: {
      //                   $eq: ['$_id', '$$local_id']
      //                 }
      //               }
      //             },
      //           ]
      //         }
      //       },
      //       {
      //         $lookup: {
      //           from: 'userauths',
      //           as: 'userauths',
      //           let: {
      //             local_id: "$userAuth.$id"
      //           },
      //           pipeline: [
      //             {
      //               $match: {
      //                 $expr: {
      //                   $and: [
      //                     { $eq: ['$_id', '$$local_id'] },
      //                   ]
      //                 }
      //               }
      //             },
      //             {
      //               $match: {
      //                 username: {
      //                   $regex: "aselole1", $options: "i"
      //                 }
      //               }
      //             },
      //           ]
      //         }
      //       }
      //     ],
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'userads',
      //     as: 'userads_data',
      //     let: {
      //       userID: "$iduser",
      //       adsID: "$idtrans"
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$userID', '$$userID'] },
      //               { $eq: ['$adsID', '$$adsID'] },
      //             ]
      //           }
      //         }
      //       },
      //     ]
      //   }
      // },
      // {
      //   $project: {
      //     _id: 1,
      //     timestamp: 1,
      //     fullName: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //         },
      //         "in": "$$tmp.fullName"
      //       }
      //     },
      //     email: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //         },
      //         "in": "$$tmp.email"
      //       }
      //     },
      //     profileID: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //         },
      //         "in": "$$tmp.profileID"
      //       }
      //     },
      //     gender: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //         },
      //         "in": "$$tmp.gender"
      //       }
      //     },
      //     ageQualication: {
      //       $switch: {
      //         branches: [
      //           {
      //             case: {
      //               $lt: [{
      //                 "$let": {
      //                   "vars": {
      //                     "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                   },
      //                   "in": "$$tmp.age"
      //                 }
      //               }, 8]
      //             },
      //             then: "< 8"
      //           },
      //           {
      //             case: {
      //               $and: [{
      //                 $gte: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 8]
      //               }, {
      //                 $lte: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 23]
      //               }]
      //             },
      //             then: "8 - 23"
      //           },
      //           {
      //             case: {
      //               $and: [{
      //                 $gte: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 24]
      //               }, {
      //                 $lte: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 39]
      //               }]
      //             },
      //             then: "24 - 39 Tahun"
      //           },
      //           {
      //             case: {
      //               $and: [{
      //                 $gte: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 1]
      //               }, {
      //                 $lt: [{
      //                   "$let": {
      //                     "vars": {
      //                       "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                     },
      //                     "in": "$$tmp.age"
      //                   }
      //                 }, 14]
      //               }]
      //             },
      //             then: "< 14 Tahun"
      //           }
      //         ],
      //         "default": "Other"
      //       }
      //     },
      //     age: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //         },
      //         "in": "$$tmp.age"
      //       }
      //     },
      //     username: {
      //       $let: {
      //         "vars": {
      //           userauths: {
      //             "$arrayElemAt": [{
      //               "$let": {
      //                 "vars": {
      //                   "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                 },
      //                 "in": "$$tmp.userauths"
      //               }
      //             }, 0]
      //           }
      //         },
      //         "in": "$$userauths.username"
      //       }
      //     },
      //     lokasi: {
      //       $let: {
      //         "vars": {
      //           areas: {
      //             "$arrayElemAt": [{
      //               "$let": {
      //                 "vars": {
      //                   "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                 },
      //                 "in": "$$tmp.areas"
      //               }
      //             }, 0]
      //           }
      //         },
      //         "in": "$$areas.stateName"
      //       }
      //     },
      //     interest: {
      //       $map: {
      //         input: {
      //           $map: {
      //             input: {
      //               "$let": {
      //                 "vars": {
      //                   "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
      //                 },
      //                 "in": "$$tmp.interests"
      //               }
      //             },
      //             in: {
      //               $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
      //             },
      //           }
      //         },
      //         in: "$$this.v"
      //       }
      //     },
      //     useradsId: {
      //       "$let": {
      //         "vars": {
      //           "tmp": { "$arrayElemAt": ["$userads_data", 0] },
      //         },
      //         "in": "$$tmp._id"
      //       }
      //     },
      //     commonality: {
      //       $cond: {
      //         if: {
      //           $and: [{
      //             "$let": {
      //               "vars": {
      //                 "tmp": { "$arrayElemAt": ["$userads_data", 0] },
      //               },
      //               "in": "$$tmp.commonality"
      //             }
      //           }, {
      //             $ne: [{
      //               "$let": {
      //                 "vars": {
      //                   "tmp": { "$arrayElemAt": ["$userads_data", 0] },
      //                 },
      //                 "in": "$$tmp.commonality"
      //               }
      //             }, ""]
      //           }]
      //         },
      //         then: {
      //           "$let": {
      //             "vars": {
      //               "tmp": { "$arrayElemAt": ["$userads_data", 0] },
      //             },
      //             "in": "$$tmp.commonality"
      //           }
      //         },
      //         else: 0
      //       }
      //     },
      //   }
      // },
    ]);
    return query;
  }

  async updateData(email: string, createUserbasicDto: CreateUserbasicDto): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ email: email },
      createUserbasicDto,
      function (err, docs) {
        if (err) {
          console.log("Updated Error : ", err)
        } else {
          console.log("Updated Docs : ", docs);
        }
      }).clone().exec();
    return data;
  }

  async updateStatusemail(email: string, timeEmailSend: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "timeEmailSend": timeEmailSend
        }
      },
    );
    return data;
  }

  async updateStatus(email: string, status: Boolean): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status
        }
      },
    );
    return data;
  }

  async updateStatusKyc(email: string, status: Boolean, statusKyc: string, startdate: string, urllink: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status,
          "statusKyc": statusKyc
        }
      },
    );

    var timestamps_end = new Date();
    timestamps_end.setHours(timestamps_end.getHours() + 7);
    var pecahdata = timestamps_end.toISOString().split("T");
    var finalend = pecahdata[0] + " " + pecahdata[1].split(".")[0];
    this.logapiSS.create2(urllink, startdate, finalend, email, null, null, null);

    return data;
  }
  async updateStatusKycName(nama: string, gender: string, email: string, status: Boolean, statusKyc: string, dob: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status,
          "statusKyc": statusKyc,
          "fullName": nama,
          "gender": gender,
          "dob": dob
        }
      },
    );
    return data;
  }
  async updateStatusKycFailed(email: string, status: Boolean, statusKyc: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status,
          "statusKyc": statusKyc
        }
      },
    );
    return data;
  }
  async updatekyc(email: string, listAddKyc: any[]): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      { $set: { "listAddKyc": listAddKyc } });
    return data;
  }
  async update(
    id: string,
    createUserbasicDto: CreateUserbasicDto,
  ): Promise<Userbasic> {
    let data = await this.userbasicModel.findByIdAndUpdate(
      id,
      createUserbasicDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async findAll(): Promise<Userbasic[]> {
    return this.userbasicModel.find().exec();
  }
  async findid(id: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ _id: id }).exec();
  }
  async findbyid(id: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }
  async findOne(email: string): Promise<Userbasic> {
    return await this.userbasicModel.findOne({ email: email }).exec();
  }
  async findOneUsername(username: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ username: username }).exec();
  }

  async findIn(username: string[]): Promise<Userbasic[]> {
    return this.userbasicModel.find().where('email').in(username).exec();
  }

  async findInbyid(userid: any[]) {
    var result = await this.userbasicModel.aggregate([
      {
        "$match":
        {
          "_id":
          {
            "$in": userid
          }
        }
      },
      {
        "$lookup":
        {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'userAuth_data',
        },
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          username:
          {
            "$arrayElemAt":
              [
                "$userAuth_data.username", 0
              ]
          }
        }
      }
    ]);

    return result;
  }

  async getUser(userid: string){
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userid),

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "data_userauths",
          let: {
            localID: '$userAuth.$id'
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
                email: 1,
                username: 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "data_mediaprofilepicts",
          let: {
            localID: '$profilePict.$id'
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
        $project: {
          fullName: 1,
          email: 1,
          userAuth: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userauths", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          username: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userauths", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          avatar: {
            "mediaBasePath": {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                  }
                },
                "in": "$$tmp.mediaBasePath"
              }
            },
            "mediaUri": {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                  }
                },
                "in": "$$tmp.mediaUri"
              }
            },
            "mediaType": {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                  }
                },
                "in": "$$tmp.mediaType"
              }
            },
            "mediaEndpoint": {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                  }
                },
                "in": "$$tmp.mediaEndpoint"
              }
            }
          }
        }
      },
    ];
    const data = await this.userbasicModel.aggregate(paramaggregate);
    return data;
  }

  async findByProfileId(mediaprofilepicts: any): Promise<Userbasic> {
    return this.userbasicModel.findOne({ "profilePict": mediaprofilepicts }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userbasicModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async updateNoneActive(email: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "email": email + '_noneactive'
        }
      });

    return data;
  }

  async updateIdVerified(id: ObjectId): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      {
        $set: {
          "isIdVerified": 'verified'
        }
      });

    return data;
  }

  async updateIdVerifiedUser(id: ObjectId, isIdVerified: boolean, statusKyc: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      {
        $set: {
          "isIdVerified": isIdVerified,
          "statusKyc": statusKyc
        }
      });

    return data;
  }
  async updateReportuser(id: Types.ObjectId, reportedStatus: string, reportedUserCount: number, reportedUser: any[], reportedUserHandle: any[]): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      { $set: { "reportedStatus": reportedStatus, "reportedUserCount": reportedUserCount, "reportedUser": reportedUser, "reportedUserHandle": reportedUserHandle } });
    return data;
  }
  async UserAge(): Promise<Object> {
    const languages = await this.languagesService.findAll();
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            languages_id: '$languages.$id',
            countries_id: '$countries.$id',
            age: {
              $dateDiff: {
                startDate: { $toDate: '$dob' },
                endDate: '$$NOW',
                unit: 'year',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },
        {
          $project: {
            age: '$age',
            email: '$email',
            userAuth: '$userAuth',
            languages: '$languages.$id',
            languages_name_: languages.filter(function (e) {
              return (e._id.oid = '$languages.$id');
            }),
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async UserActiveLastYear(year: number): Promise<Object> {
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
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
          },
        },
        {
          $sort: { '_id.year_month': 1 },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },
        {
          $project: {
            createdAt: '$createdAt',
            first: { $arrayElemAt: ['$userAuth_data', 0] },
          },
        },
        {
          $addFields: {
            userAuth_id__: '$first.isEnabled',
          },
        },
        {
          $project: {
            IsActive: '$userAuth_id__',
            createdAt: '$createdAt',
            YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
            year_param: { $toInt: year_param.toString() },

          },
        },
        {
          $match: {
            IsActive: true,
            YearcreatedAt: year_param,
          },
        },
        {
          $group: {
            _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            month_: { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
            month_name_: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            year_: { $substrCP: ['$_id.year_month', 0, 4] },
          },
        },
        {
          $project: {
            _id: 0,
            month_name: '$month_name_',
            month: '$month_',
            year: { $toInt: '$year_' },
            count: 1,
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async UserActiveDay(day: number): Promise<Object> {
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            createdAt_: { $toDate: { $substrCP: ['$createdAt', 0, 10] } },
            today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
            today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
          },
        },
        {
          $sort: { '_id.year_month': 1 },
        },
        {
          $match: {
            createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },
        {
          $project: {
            createdAt: '$createdAt',
            first: { $arrayElemAt: ['$userAuth_data', 0] },
          },
        },
        {
          $addFields: {
            userAuth_id__: '$first.isEnabled',
          },
        },
        {
          $project: {
            IsActive: '$userAuth_id__',
            createdAt: '$createdAt',
          },
        },
        {
          $match: {
            IsActive: true,
          },
        },
        {
          $group: {
            _id: { createdAt_data: { $substrCP: ['$createdAt', 0, 10] } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { createdAt_data: 1 },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.createdAt_data',
            count: 1,
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async getinterest(email: string, langIso: string, pageNumber: number, pageRow: number, search: string): Promise<object> {

    const query = await this.userbasicModel.aggregate([
      {
        $lookup: {
          from: "interests_repo",
          localField: "userInterests.$id",
          foreignField: "_id",
          as: "field"
        }
      }, {
        "$unwind": {
          "path": "$field",
          "preserveNullAndEmptyArrays": false
        }
      }, {
        $match: {
          "email": email,
          "field.interestName": search,
          "field.langIso": langIso
        }
      }, {
        "$project": {
          "langIso": "$field.langIso",
          "cts": "$field.createdAt",
          "icon": "$field.icon",
          "interestName": "$field.interestName"
        }
      },

      { $skip: pageNumber },
      { $limit: pageRow },

    ]);

    return query;
  }

  async viewdatabyuser(id: object): Promise<object> {
    const query = await this.userbasicModel.aggregate([
      {
        $match: {
          _id: id
        }
      },
      {
        $lookup: {
          from: "announcements",
          localField: "_id",
          foreignField: "Detail.iduser",
          as: "pengumuman"
        }
      },
      {
        $project: {
          email: "$email",
          fullName: "$fullName",
          info: "$pengumuman"
        }
      },
    ]);


    return query;
  }

  async findOneupdatebyEmail(email: String) {
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      { $inc: { otp_attemp: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async kycList(startDate: String, endDate: String, search: String, skip: number, limit: number) {

    var date_range_match = {};
    var startDate_format = null;
    var endDate_format = null;
    var skip_ = null;
    var limit_ = null;
    if (startDate != null) {
      startDate_format = new Date(startDate.toString());
    }
    if (endDate != null) {
      endDate_format = new Date(endDate.toString());
    }
    if (startDate_format != null && endDate_format != null) {
      date_range_match = { "createdAt_format": { $gte: startDate_format, $lte: endDate_format } };
    }
    let Query_aggregate = [
      {
        $match: {
          proofPict: { $exists: true }
        }
      },
      {
        $addFields: {
          id_mediaproofpicts: '$proofPict.$id',
          id_mediaprofilepicts: '$profilePict.$id',
          startDate: startDate_format,
          endDate: endDate_format
        },
      },
      {
        $lookup: {
          from: "mediaproofpicts",
          localField: "id_mediaproofpicts",
          foreignField: "_id",
          as: "mediaproofpicts"
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'id_mediaprofilepicts',
          foreignField: '_id',
          as: 'mediaprofilepicts',
        },
      },
      {
        $match: {
          $and: [
            { "mediaproofpicts.status": { $exists: true } },
            { "mediaproofpicts.status": { $ne: "" } },
            {
              $or: [
                date_range_match,
                { "fullName": { $regex: search } },
                { "email": { $regex: search } },
              ]
            },
          ]
        }
      },
      {
        $project: {
          _id: 0,
          fullName: '$fullName',
          email: '$email',
          startDate: '$startDate',
          endDate: '$endDate',
          mediaproofpicts_: { $arrayElemAt: ['$mediaproofpicts', 0] },
          mediaprofilepicts_: { $arrayElemAt: ['$mediaprofilepicts', 0] }
        },
      },
      {
        $addFields: {
          createdAt_format: { $toDate: { $substrCP: ['$mediaproofpicts_.createdAt', 0, 10] } },
        },
      },
      {
        $match: {
          $and: [
            date_range_match
          ]
        }
      },
      {
        $project: {
          _id: 0,
          fullName: '$fullName',
          email: '$email',
          dateOfSubmission: '$mediaproofpicts_.createdAt',
          status: '$mediaproofpicts_.status',
          state: '$mediaproofpicts_.state',
          avatar: {
            mediaBasePath: '$mediaprofilepicts_.mediaBasePath',
            mediaUri: '$mediaprofilepicts_.mediaUri',
            mediaType: '$mediaprofilepicts_.mediaType',
            mediaEndpoint: '$mediaprofilepicts_.fsTargetUri',
            //medreplace: { $replaceOne: { input: "$mediaprofilepicts_.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
      },
    ];
    if (skip != null) {
      skip_ = { $skip: Number(skip) };
      Query_aggregate.push(skip_);
    }
    if (limit != null) {
      limit_ = { $limit: Number(limit) };
      Query_aggregate.push(limit_);
    }
    const query = await this.userbasicModel.aggregate(Query_aggregate);
    return query;
  }
  async countBy() {
    const query = await this.userbasicModel.aggregate([
      {
        $facet: {

          "gender": [
            {
              $lookup: {
                from: 'userauths',
                localField: 'email',
                foreignField: 'email',
                as: 'authdata',

              },

            },
            {
              $unwind: {
                path: "$authdata",

              }
            },
            {
              $match: {
                'authdata.isEnabled': true
              }
            },
            {
              $project: {
                gender: 1
              }
            },
            {
              $project: {

                gender: {

                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: ['$gender', 'FEMALE']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', ' FEMALE']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Perempuan']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Wanita']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'MALE']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', ' MALE']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Laki-laki']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Pria']
                        },
                        then: 'MALE',

                      },

                    ],
                    default: "OTHER",

                  },

                },

              }
            },
            {
              $project: {
                gender: 1,

              }
            },
            {
              "$group": {
                "_id": "$gender",
                "count": {
                  "$sum": 1
                }
              }
            }
          ],
          "userActive": [

            {
              $lookup: {
                from: 'userauths',
                localField: 'email',
                foreignField: 'email',
                as: 'authdata',

              },

            },
            {
              $unwind: {
                path: "$authdata",

              }
            },
            {
              $match: {
                'authdata.isEnabled': true
              }
            },
            {
              $project: {
                gender: 1
              }
            },
            {
              "$group": {
                "_id": null,
                "count": {
                  "$sum": 1
                }
              }
            }
          ],
          "ads": [
            {
              $lookup: {
                from: 'ads',
                localField: '_id',
                foreignField: 'userID',
                as: 'adsdata',

              },

            },
            {
              $unwind: {
                path: "$adsdata",

              }
            },
            {
              $project: {
                userid: "$adsdata.userID"
              }
            },
            {
              "$group": {
                "_id": null,
                "count": {
                  "$sum": 1
                }
              }
            }
          ]
        }
      },
      {
        $project: {

          gender: '$gender',
          userActive: {
            $arrayElemAt: ['$userActive.count', 0]
          },
          ads: {
            $arrayElemAt: ['$ads.count', 0]
          },

        }
      }
    ]);
    return query;
  }

  async transaksiHistory(email: string, skip: number, limit: number, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any, voucher: any) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var pipeline = [];

    pipeline.push(
      {
        $match:
        {
          "email": email,

        }
      },
      {
        $lookup: {
          from: 'userauths',
          as: 'auth',
          let: {
            localID: '$email'
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
              }
            },

          ],

        },

      },
      {
        $unwind: {
          path: "$auth",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 1,
          "userName": '$auth.username',
          "fullName": 1,
          "email": 1,

        }
      },
      {
        $facet:
        {

          "balances": [
            {
              "$lookup": {
                from: "accountbalances",
                as: "balance",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or: [
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "rewards"
                              },

                            ]
                        },
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "disbursement"
                              },
                              {
                                "description": "FAILED TRANSACTION"
                              },

                            ]
                        },
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "withdraw"
                              },
                              {
                                "description": "FAILED TRANSACTION"
                              },

                            ]
                        },

                      ]
                    },

                  },
                  {
                    $project: {
                      "jenis":
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$eq":
                              ["$type", "rewards"]
                          },
                          then: "Rewards",
                          else:
                          {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                  ["$type", "withdraw"]
                              },
                              then: "Withdraws",
                              else: "Disbursement"
                            }
                          },
                        }
                      },
                      "type":
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$eq":
                              ["$type", "rewards"]
                          },
                          then: "Rewards",
                          else:
                          {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                  ["$type", "withdraw"]
                              },
                              then: "Withdraws",
                              else: "Disbursement"
                            }
                          },
                        }
                      },
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": "$kredit",
                      "totalamount": "$kredit",
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "+",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$balance",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "tariks": [
            {
              "$lookup": {
                from: "withdraws",
                as: "tarik",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$idUser', '$$localID']
                            }
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",

                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status":
                      {
                        $cond: {
                          if: {
                            $or: [
                              {
                                $eq: ["$status", "Request is In progress"]
                              },
                              {
                                $eq: ["$status", "Success"]
                              },

                            ],

                          },
                          then: "Success",
                          else: "Failed"
                        }
                      },
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$tarik",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "transactions": [
            {
              "$lookup": {
                from: "transactions",
                as: "buy-sell",
                let: {
                  localID: '$_id'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or:
                        [
                          {
                            $expr: {
                              $eq: ['$iduserbuyer', '$$localID']
                            }
                          },
                          {
                            $expr: {
                              $eq: ['$idusersell', '$$localID']
                            }
                          }
                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "$type",
                      "type":
                      {
                        $cond: {
                          if: {
                            $eq: ['$iduserbuyer', '$$localID']
                          },
                          then: "Buy",
                          else: 'Sell'
                        }
                      },
                      "timestamp": 1,
                      "timeStart":
                      {
                        "$dateToString": {
                          "format": "%Y-%m-%dT%H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      },
                      "status":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "Cancel",
                          else: '$status'
                        }
                      },
                      "description":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "$VA expired time",
                          else: 'description'
                        }
                      },
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,

                    }
                  },
                  // {
                  //     $sort: {
                  //         "timestamp": - 1,
                  //         
                  //     }
                  // },
                ],

              },

            },
            {
              "$lookup": {
                from: "posts",
                as: "post",
                let: {
                  localID: '$buy-sell.postid'
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

                      "postID": 1,
                      "description": 1,
                      "postType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediapicts",
                as: "pict",
                let: {
                  localID: '$buy-sell.postid'
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

                      ]
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediavideos",
                as: "video",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediadiaries",
                as: "diary",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediastories",
                as: "story",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'penjual',
                let: {
                  localID: '$buy-sell.idusersell'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'pembeli',
                let: {
                  localID: '$buy-sell.iduserbuyer'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'penjualAuth',
                let: {
                  localID: '$penjual.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'pembeliAuth',
                let: {
                  localID: '$pembeli.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$buy-sell",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "settings",
                as: "setting",
                pipeline: [
                  {
                    $match:
                    {
                      "_id": new Types.ObjectId("648ae670766c00007d004a82")
                    }
                  },

                ]
              }
            },
            {
              $project: {
                "transaction": [{
                  //"video": 1,
                  "_id": "$buy-sell._id",
                  "timestart": "$buy-sell.timeStart",
                  //"did": "$buy-sell.postid",
                  "iduser": "$_id",
                  "type": "$buy-sell.type",
                  "jenis": "$buy-sell.jenis",
                  "timestamp": "$buy-sell.timestamp",
                  "description": "$buy-sell.description",
                  "noinvoice": "$buy-sell.noinvoice",
                  "nova": "$buy-sell.nova",
                  "expiredtimeva": "$buy-sell.expiredtimeva",
                  "bank": "$buy-sell.bank",
                  "amount": "$buy-sell.amount",
                  "iconVoucher": {
                    $arrayElemAt: ['$setting.value', 0]
                  },
                  "totalamount":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$buy-sell.amount",
                      else: '$buy-sell.totalamount'
                    }
                  },
                  "status": "$buy-sell.status",
                  "email": "$email",
                  "fullName": "$fullname",
                  "userame": "$fullname",
                  "penjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.fullName', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.email', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjualAuth.username', {
                          "$indexOfArray": [
                            "$penjualAuth.email",
                            {
                              $arrayElemAt: ['$penjual.email', {
                                "$indexOfArray": [
                                  "$penjual._id",
                                  "$buy-sell.idusersell"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "pembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.fullName', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.email', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeliAuth.username', {
                          "$indexOfArray": [
                            "$pembeliAuth.email",
                            {
                              $arrayElemAt: ['$pembeli.email', {
                                "$indexOfArray": [
                                  "$pembeli._id",
                                  "$buy-sell.iduserbuyer"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "postID": "$buy-sell.postid",
                  "postType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "descriptionContent":
                  {
                    $arrayElemAt: ['$post.description', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "title":
                  {
                    $arrayElemAt: ['$post.title', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsaraId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsara":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsara', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsara', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsara', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsara', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "debetKredit":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Buy"]
                          },
                          then: null
                        },
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Sell"]
                          },
                          then: "+"
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "mediaThumbEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsaraThumbId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraThumbId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraThumbId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraThumbId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraThumbId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },

                }]
              }
            },
            {
              $unwind: {
                path: "$transaction",
                preserveNullAndEmptyArrays: true
              }
            },

          ],

        }
      },
      {
        $project: {
          "tester":
          {
            $concatArrays: [
              '$balances.balance',
              '$tariks.tarik',
              '$transactions.transaction'
            ],

          },

        }
      },
      {
        $unwind: {
          path: "$tester",

        }
      },
      {
        $project: {
          "_id": '$tester._id',
          "iduser":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.iduser',
              else: "$kodok"
            }
          },
          "type": '$tester.type',
          "jenis": '$tester.jenis',
          "timestamp": '$tester.timestamp',
          "description": '$tester.description',
          "noinvoice": '$tester.noinvoice',
          "nova": '$tester.nova',
          "expiredtimeva": '$tester.expiredtimeva',
          "bank": '$tester.bank',
          "amount": '$tester.amount',
          "totalamount": '$tester.totalamount',
          "status": '$tester.status',
          "fullName": '$tester.fullName',
          "email":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.email',
              else: "$kodok"
            }
          },
          "penjual": '$tester.penjual',
          "emailpenjual": '$tester.emailpenjual',
          "userNamePenjual": '$tester.userNamePenjual',
          "pembeli": '$tester.pembeli',
          "emailpembeli": '$tester.emailpembeli',
          "userNamePembeli": '$tester.userNamePembeli',
          "postID": '$tester.postID',
          "postType": '$tester.postType',
          "descriptionContent": '$tester.descriptionContent',
          "title": '$tester.title',
          "mediaType": '$tester.mediaType',
          "mediaEndpoint": '$tester.mediaEndpoint',
          "mediaThumbEndpoint": '$tester.mediaThumbEndpoint',
          "apsaraThumbId": '$tester.apsaraThumbId',
          "apsaraId": '$tester.apsaraId',
          "apsara": '$tester.apsara',
          "debetKredit": '$tester.debetKredit',
          "timestart": "$tester.timestart",
          "iconVoucher": "$tester.iconVoucher",

        }
      },
    );

    if (sell === true && buy === false && withdrawal === false && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { "type": "Sell", "jenis": "CONTENT" } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { "type": "Buy", "jenis": "CONTENT" } });
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { "type": "Withdraws" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === false && voucher === false) {
      pipeline.push({ $match: { "type": "Rewards" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === true && voucher === false) {
      pipeline.push({ $match: { "type": "Buy", "jenis": "BOOST_CONTENT" } });
    }
    else if (sell === true && buy === true && withdrawal === false && rewards === false && boost === false && voucher === false) {

      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }] } },);
    }

    else if (sell === true && buy === false && withdrawal === true && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Withdraws" }] } },);
    }

    else if (sell === true && buy === false && withdrawal === false && rewards === true && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === true && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }

    else if (sell === false && buy === true && withdrawal === true && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === true && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Rewards" }] } },);
    }

    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === true && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === true && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }

    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === true && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === true && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }

    else if (sell === true && buy === true && withdrawal === true && rewards === false && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === false && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === true && voucher === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { "jenis": "VOUCHER" } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === false && rewards === false && boost === false && voucher === true) {

      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === true && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === true && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Rewards" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === true && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === true && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Rewards" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === true && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Rewards" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === false && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === false && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Rewards" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === true && voucher === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": "CONTENT" }, { "type": "Buy", "jenis": "CONTENT" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "VOUCHER" }] } },);
    }

    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

    }

    pipeline.push({
      $sort: {
        "timestamp": - 1,

      }
    },
      {
        $skip: skip
      },
      {
        $limit: limit
      },);
    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

  async transaksiHistoryBisnis(email: string, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any, page: number, limit: number, descending: boolean) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    var pipeline = [];



    pipeline.push(
      {
        $match:
        {
          "email": email,

        }
      },
      {
        $lookup: {
          from: 'userauths',
          as: 'auth',
          let: {
            localID: '$email'
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
              }
            },

          ],

        },

      },
      {
        $unwind: {
          path: "$auth",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 1,
          "userName": '$auth.username',
          "fullName": 1,
          "email": 1,

        }
      },
      {
        $facet:
        {

          "balances": [
            {
              "$lookup": {
                from: "accountbalances",
                as: "balance",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or: [
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "rewards"
                              },

                            ]
                        },
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "disbursement"
                              },
                              {
                                "description": "FAILED TRANSACTION"
                              },

                            ]
                        },
                        {
                          $and:
                            [
                              {
                                $expr: {
                                  $eq: ['$iduser', '$$localID']
                                }
                              },
                              {
                                "type": "withdraw"
                              },
                              {
                                "description": "FAILED TRANSACTION"
                              },

                            ]
                        },

                      ]
                    },

                  },
                  {
                    $project: {
                      "jenis":
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$eq":
                              ["$type", "rewards"]
                          },
                          then: "Rewards",
                          else:
                          {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                  ["$type", "withdraw"]
                              },
                              then: "Withdraws",
                              else: "Disbursement"
                            }
                          },
                        }
                      },
                      "type":
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$eq":
                              ["$type", "rewards"]
                          },
                          then: "Rewards",
                          else:
                          {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                  ["$type", "withdraw"]
                              },
                              then: "Withdraws",
                              else: "Disbursement"
                            }
                          },
                        }
                      },
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": "$kredit",
                      "totalamount": "$kredit",
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "+",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$balance",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "tariks": [
            {
              "$lookup": {
                from: "withdraws",
                as: "tarik",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$idUser', '$$localID']
                            }
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",

                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status":
                      {
                        $cond: {
                          if: {
                            $or: [
                              {
                                $eq: ["$status", "Request is In progress"]
                              },
                              {
                                $eq: ["$status", "Success"]
                              },

                            ],

                          },
                          then: "Success",
                          else: "Failed"
                        }
                      },
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$tarik",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "transactions": [
            {
              "$lookup": {
                from: "transactions",
                as: "buy-sell",
                let: {
                  localID: '$_id'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or:
                        [
                          {
                            $expr: {
                              $eq: ['$iduserbuyer', '$$localID']
                            }
                          },
                          {
                            $expr: {
                              $eq: ['$idusersell', '$$localID']
                            }
                          }
                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "$type",
                      "type":
                      {
                        $cond: {
                          if: {
                            $eq: ['$iduserbuyer', '$$localID']
                          },
                          then: "Buy",
                          else: 'Sell'
                        }
                      },
                      "timestamp": 1,
                      "timeStart":
                      {
                        "$dateToString": {
                          "format": "%Y-%m-%dT%H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      },
                      "status":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "Cancel",
                          else: '$status'
                        }
                      },
                      "description":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "$VA expired time",
                          else: 'description'
                        }
                      },
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,

                    }
                  },
                  // {
                  //     $sort: {
                  //         "timestamp": - 1,
                  //         
                  //     }
                  // },
                ],

              },

            },
            {
              "$lookup": {
                from: "posts",
                as: "post",
                let: {
                  localID: '$buy-sell.postid'
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

                      "postID": 1,
                      "description": 1,
                      "postType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediapicts",
                as: "pict",
                let: {
                  localID: '$buy-sell.postid'
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

                      ]
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediavideos",
                as: "video",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediadiaries",
                as: "diary",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediastories",
                as: "story",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", ""]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'penjual',
                let: {
                  localID: '$buy-sell.idusersell'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'pembeli',
                let: {
                  localID: '$buy-sell.iduserbuyer'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'penjualAuth',
                let: {
                  localID: '$penjual.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'pembeliAuth',
                let: {
                  localID: '$pembeli.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$buy-sell",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "settings",
                as: "setting",
                pipeline: [
                  {
                    $match:
                    {
                      "_id": new Types.ObjectId("648ae670766c00007d004a82")
                    }
                  },

                ]
              }
            },
            {
              $project: {
                "transaction": [{
                  //"video": 1,
                  "_id": "$buy-sell._id",
                  "timestart": "$buy-sell.timeStart",
                  //"did": "$buy-sell.postid",
                  "iduser": "$_id",
                  "type": "$buy-sell.type",
                  "jenis": "$buy-sell.jenis",
                  "timestamp": "$buy-sell.timestamp",
                  "description": "$buy-sell.description",
                  "noinvoice": "$buy-sell.noinvoice",
                  "nova": "$buy-sell.nova",
                  "expiredtimeva": "$buy-sell.expiredtimeva",
                  "bank": "$buy-sell.bank",
                  "amount": "$buy-sell.amount",
                  "iconVoucher": {
                    $arrayElemAt: ['$setting.value', 0]
                  },
                  "totalamount":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$buy-sell.amount",
                      else: '$buy-sell.totalamount'
                    }
                  },
                  "status": "$buy-sell.status",
                  "email": "$email",
                  "fullName": "$fullname",
                  "userame": "$fullname",
                  "penjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.fullName', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.email', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjualAuth.username', {
                          "$indexOfArray": [
                            "$penjualAuth.email",
                            {
                              $arrayElemAt: ['$penjual.email', {
                                "$indexOfArray": [
                                  "$penjual._id",
                                  "$buy-sell.idusersell"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "pembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.fullName', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.email', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeliAuth.username', {
                          "$indexOfArray": [
                            "$pembeliAuth.email",
                            {
                              $arrayElemAt: ['$pembeli.email', {
                                "$indexOfArray": [
                                  "$pembeli._id",
                                  "$buy-sell.iduserbuyer"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "postID": "$buy-sell.postid",
                  "postType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "descriptionContent":
                  {
                    $arrayElemAt: ['$post.description', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "title":
                  {
                    $arrayElemAt: ['$post.title', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsaraId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsara":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsara', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsara', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsara', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsara', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "debetKredit":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Buy"]
                          },
                          then: null
                        },
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Sell"]
                          },
                          then: "+"
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "mediaThumbEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaThumbEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsaraThumbId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraThumbId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraThumbId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraThumbId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraThumbId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },

                }]
              }
            },
            {
              $unwind: {
                path: "$transaction",
                preserveNullAndEmptyArrays: true
              }
            },

          ],

        }
      },
      {
        $project: {
          "tester":
          {
            $concatArrays: [
              '$balances.balance',
              '$tariks.tarik',
              '$transactions.transaction'
            ],

          },

        }
      },
      {
        $unwind: {
          path: "$tester",

        }
      },
      {
        $project: {
          "_id": '$tester._id',
          "iduser":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.iduser',
              else: "$kodok"
            }
          },
          "type": '$tester.type',
          "jenis": '$tester.jenis',
          "timestamp": '$tester.timestamp',
          "description": '$tester.description',
          "noinvoice": '$tester.noinvoice',
          "nova": '$tester.nova',
          "expiredtimeva": '$tester.expiredtimeva',
          "bank": '$tester.bank',
          "amount": '$tester.amount',
          "totalamount": '$tester.totalamount',
          "status": '$tester.status',
          "fullName": '$tester.fullName',
          "email":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.email',
              else: "$kodok"
            }
          },
          "penjual": '$tester.penjual',
          "emailpenjual": '$tester.emailpenjual',
          "userNamePenjual": '$tester.userNamePenjual',
          "pembeli": '$tester.pembeli',
          "emailpembeli": '$tester.emailpembeli',
          "userNamePembeli": '$tester.userNamePembeli',
          "postID": '$tester.postID',
          "postType": '$tester.postType',
          "descriptionContent": '$tester.descriptionContent',
          "title": '$tester.title',
          "mediaType": '$tester.mediaType',
          "mediaEndpoint": '$tester.mediaEndpoint',
          "mediaThumbEndpoint": '$tester.mediaThumbEndpoint',
          "apsaraThumbId": '$tester.apsaraThumbId',
          "apsaraId": '$tester.apsaraId',
          "apsara": '$tester.apsara',
          "debetKredit": '$tester.debetKredit',
          "timestart": "$tester.timestart",
          "iconVoucher": "$tester.iconVoucher",

        }
      },
      {
        $addFields: {


          certi: {
            $cmp: ["$certified", 0]
          },

        }
      },
      {
        $project: {
          "_id": 1,
          "iduser": 1,
          "type": 1,
          "jenis": 1,
          "timestamp": 1,
          "description": 1,
          "certified":
          {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$certi", - 1]
                }, {
                  $eq: ["$certi", 0]
                }]
              },
              then: false,
              else: "$certified"
            }
          },
          "noinvoice": 1,
          "nova": 1,
          "expiredtimeva": 1,
          "bank": 1,
          "amount": 1,
          "totalamount": 1,
          "status": 1,
          "fullName": 1,
          "email": 1,
          "postID": 1,
          "postType": 1,
          "descriptionContent": 1,
          "title": 1,

        }
      },
      {
        $project: {
          "_id": 1,
          "iduser": 1,
          "type": 1,
          "jenis": 1,
          "timestamp": 1,
          "description": 1,
          "noinvoice": 1,
          "nova": 1,
          "expiredtimeva": 1,
          "bank": 1,
          "amount": 1,
          "totalamount": 1,
          "status": 1,
          // "fullName": 1,
          "email": 1,
          "postID": 1,
          "postType": 1,
          "descriptionContent": 1,
          "title": 1,
          // "kepemilikan":
          // {
          //   $cond: {
          //     if: {
          //       $or: [{
          //         $eq: ["$certified", false]
          //       }, {
          //         $eq: ["$certified", ""]
          //       }]
          //     },
          //     then: "TIDAK",
          //     else: "YA"
          //   }
          // },

        }
      },
    );

    if (sell === true && buy === false && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Sell" } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Buy" } });
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Withdraws" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { "type": "Rewards" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", }, { "type": "Buy", }] } },);
    }
    else if (sell === true && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }

    else if (sell === false && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, , { "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }


    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

    }

    pipeline.push({
      $sort: {
        timestamp: order
      },

    },);
    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

  async transaksiHistoryBisnisCount(email: string, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];

    pipeline.push(
      {
        $match:
        {
          "email": email
        }
      },
      {
        $lookup: {
          from: 'userauths',
          as: 'auth',
          let: {
            localID: '$email'
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
              }
            },

          ],

        },

      },
      {
        $unwind: {
          path: "$auth",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 1,
          "userName": '$auth.username',
          "fullName": 1,
          "email": 1,

        }
      },
      {
        $facet:
        {

          "balances": [
            {
              "$lookup": {
                from: "accountbalances",
                as: "balance",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$iduser', '$$localID']
                            }
                          },
                          {
                            "type": "rewards"
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Rewards",
                      "type": "Rewards",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": "$kredit",
                      "totalamount": "$kredit",
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "+",
                      "fullName": 1,
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$balance",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "tariks": [
            {
              "$lookup": {
                from: "withdraws",
                as: "tarik",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$idUser', '$$localID']
                            }
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",
                      "fullName": "$fullName",
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$tarik",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "transactions": [
            {
              "$lookup": {
                from: "transactions",
                as: "buy-sell",
                let: {
                  localID: '$_id'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or:
                        [
                          {
                            $expr: {
                              $eq: ['$iduserbuyer', '$$localID']
                            }
                          },
                          {
                            $expr: {
                              $eq: ['$idusersell', '$$localID']
                            }
                          }
                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "$type",
                      "type":
                      {
                        $cond: {
                          if: {
                            $eq: ['$iduserbuyer', '$$localID']
                          },
                          then: "Buy",
                          else: 'Sell'
                        }
                      },
                      "timestamp": 1,
                      "timeStart":
                      {
                        "$dateToString": {
                          "format": "%Y-%m-%dT%H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      },
                      "status":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "Cancel",
                          else: '$status'
                        }
                      },
                      "description":
                      {
                        $cond: {
                          if:
                          {
                            $and: [
                              {
                                $lt: ['$expiredtimeva', {
                                  "$dateToString": {
                                    "format": "%Y-%m-%dT%H:%M:%S",
                                    "date": {
                                      $add: [new Date(), 25200000]
                                    }
                                  }
                                },]
                              },
                              {
                                $eq: ['$status', 'WAITING_PAYMENT']
                              }
                            ]
                          },
                          then: "$VA expired time",
                          else: 'description'
                        }
                      },
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,

                    }
                  },
                  // {
                  //     $sort: {
                  //         "timestamp": - 1,
                  //         
                  //     }
                  // },
                ],

              },

            },
            {
              "$lookup": {
                from: "posts",
                as: "post",
                let: {
                  localID: '$buy-sell.postid'
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

                      "postID": 1,
                      "description": 1,
                      "postType": 1,
                      "certified": 1
                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediapicts",
                as: "pict",
                let: {
                  localID: '$buy-sell.postid'
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

                      ]
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", false]
                      },
                      "apsaraThumbId":
                      {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": 1,
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediavideos",
                as: "video",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", false]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediadiaries",
                as: "diary",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", false]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediastories",
                as: "story",
                let: {
                  localID: '$buy-sell.postid'
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
                      "postID": 1,
                      "apsara": {
                        $ifNull: ["$apsara", false]
                      },
                      "apsaraId": {
                        $ifNull: ["$apsaraId", false]
                      },
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'penjual',
                let: {
                  localID: '$buy-sell.idusersell'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'pembeli',
                let: {
                  localID: '$buy-sell.iduserbuyer'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'penjualAuth',
                let: {
                  localID: '$penjual.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'pembeliAuth',
                let: {
                  localID: '$pembeli.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$buy-sell",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "transaction": [{
                  //"video": 1,
                  "_id": "$buy-sell._id",
                  "timestart": "$buy-sell.timeStart",
                  //"did": "$buy-sell.postid",
                  "iduser": "$_id",
                  "type": "$buy-sell.type",
                  "jenis": "$buy-sell.jenis",
                  "timestamp": "$buy-sell.timestamp",
                  "description": "$buy-sell.description",
                  "noinvoice": "$buy-sell.noinvoice",
                  "nova": "$buy-sell.nova",
                  "expiredtimeva": "$buy-sell.expiredtimeva",
                  "bank": "$buy-sell.bank",
                  "amount": "$buy-sell.amount",
                  "totalamount":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$buy-sell.amount",
                      else: '$buy-sell.totalamount'
                    }
                  },
                  "status": "$buy-sell.status",
                  "email": "$email",
                  "fullName": "$fullName",
                  "username": "$fullName",
                  "penjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.fullName', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.email', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjualAuth.username', {
                          "$indexOfArray": [
                            "$penjualAuth.email",
                            {
                              $arrayElemAt: ['$penjual.email', {
                                "$indexOfArray": [
                                  "$penjual._id",
                                  "$buy-sell.idusersell"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "pembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.fullName', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.email', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeliAuth.username', {
                          "$indexOfArray": [
                            "$pembeliAuth.email",
                            {
                              $arrayElemAt: ['$pembeli.email', {
                                "$indexOfArray": [
                                  "$pembeli._id",
                                  "$buy-sell.iduserbuyer"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "postID": "$buy-sell.postid",
                  "postType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "certified": {
                    $arrayElemAt: ['$post.certified', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "descriptionContent":
                  {
                    $arrayElemAt: ['$post.description', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "title":
                  {
                    $arrayElemAt: ['$post.title', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },

                  "mediaEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsaraId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "apsara":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsara', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsara', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsara', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsara', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "$kampret"
                    }
                  },
                  "debetKredit":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Buy"]
                          },
                          then: null
                        },
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Sell"]
                          },
                          then: "+"
                        },

                      ],
                      "default": "$kampret"
                    }
                  },

                }]
              }
            },
            {
              $unwind: {
                path: "$transaction",
                preserveNullAndEmptyArrays: true
              }
            },

          ],

        }
      },
      {
        $project: {
          "tester":
          {
            $concatArrays: [
              '$balances.balance',
              '$tariks.tarik',
              '$transactions.transaction'
            ],

          },

        }
      },
      {
        $unwind: {
          path: "$tester",

        }
      },
      {
        $project: {
          "_id": '$tester._id',
          "iduser":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.iduser',
              else: "$kodok"
            }
          },
          "type": '$tester.type',
          "jenis": '$tester.jenis',
          "timestamp": '$tester.timestamp',
          "description": '$tester.description',
          "certified": '$tester.certified',
          "noinvoice": '$tester.noinvoice',
          "nova": '$tester.nova',
          "expiredtimeva": '$tester.expiredtimeva',
          "bank": '$tester.bank',
          "amount": '$tester.amount',
          "totalamount": '$tester.totalamount',
          "status": '$tester.status',
          "fullName": '$tester.fullName',
          "email":
          {
            $cond: {
              if: {
                $gt: ['$tester.amount', 0]
              },
              then: '$tester.email',
              else: "$kodok"
            }
          },
          "penjual": '$tester.penjual',
          "emailpenjual": '$tester.emailpenjual',
          "userNamePenjual": '$tester.userNamePenjual',
          "pembeli": '$tester.pembeli',
          "emailpembeli": '$tester.emailpembeli',
          "userNamePembeli": '$tester.userNamePembeli',
          "postID": '$tester.postID',
          "postType": '$tester.postType',
          "descriptionContent": '$tester.descriptionContent',
          "title": '$tester.title',

        }
      },
      {
        $addFields: {


          certi: {
            $cmp: ["$certified", 0]
          },

        }
      },
      {
        $project: {
          "_id": 1,
          "iduser": 1,
          "type": 1,
          "jenis": 1,
          "timestamp": 1,
          "description": 1,
          "certified":
          {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$certi", - 1]
                }, {
                  $eq: ["$certi", 0]
                }]
              },
              then: false,
              else: "$certified"
            }
          },
          "noinvoice": 1,
          "nova": 1,
          "expiredtimeva": 1,
          "bank": 1,
          "amount": 1,
          "totalamount": 1,
          "status": 1,
          "fullName": 1,
          "email": 1,
          "postID": 1,
          "postType": 1,
          "descriptionContent": 1,
          "title": 1,

        }
      },
      {
        $project: {
          "_id": 1,
          "iduser": 1,
          "type": 1,
          "jenis": 1,
          "timestamp": 1,
          "description": 1,
          "noinvoice": 1,
          "nova": 1,
          "expiredtimeva": 1,
          "bank": 1,
          "amount": 1,
          "totalamount": 1,
          "status": 1,
          // "fullName": 1,
          "email": 1,
          "postID": 1,
          "postType": 1,
          "descriptionContent": 1,
          "title": 1,
          // "kepemilikan":
          // {
          //   $cond: {
          //     if: {
          //       $or: [{
          //         $eq: ["$certified", false]
          //       }, {
          //         $eq: ["$certified", ""]
          //       }]
          //     },
          //     then: "TIDAK",
          //     else: "YA"
          //   }
          // },

        }
      },

    );

    if (sell === true && buy === false && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Sell" } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Buy" } });
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Withdraws" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { "type": "Rewards" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", }, { "type": "Buy", }] } },);
    }
    else if (sell === true && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }

    else if (sell === false && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, , { "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }, { "type": "Buy", "jenis": "BOOST_CONTENT+OWNERSHIP" }] } },);
    }


    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

    }

    pipeline.push({
      $group: {
        _id: null,
        totalpost: {
          $sum: 1
        }
      }
    });
    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

  async getUserDetails(id: string): Promise<any> {
    var ObjectId_ = new mongoose.Types.ObjectId(id);

    // var dateNow = new Date("2022-12-01");
    // var currentDateNowString = new Date(dateNow.getTime() - (dateNow.getTimezoneOffset() * 60000)).toISOString();
    // var currentDateNow = new Date(currentDateNowString);
    // var currentDateNowFormat = currentDateNow.toISOString().split('T')[0] + " " + currentDateNow.toISOString().split('T')[1].split('.')[0];
    // console.log("currentDateNowFormat START",currentDateNowFormat);

    // var dateNow_ = new Date("2022-12-02");
    // dateNow_.setDate(dateNow_.getDate() + 7)
    // var currentDateNowString_ = new Date(dateNow_.getTime() - (dateNow_.getTimezoneOffset() * 60000)).toISOString();
    // var currentDateNow_ = new Date(currentDateNowString_);
    // var currentDateNowFormat_ = currentDateNow_.toISOString().split('T')[0] + " " + currentDateNow_.toISOString().split('T')[1].split('.')[0];
    // console.log("currentDateNowFormat_ END", currentDateNowFormat_);

    const query = await this.userbasicModel.aggregate([
      {
        $match:
        {
          "_id": ObjectId_
        }
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'userauths_data',

        },

      },
      {
        $lookup: {
          from: 'insights',
          localField: 'email',
          foreignField: 'email',
          as: 'insights_data',

        },

      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities.$id',
          foreignField: '_id',
          as: 'cities_data',

        },

      },
      {
        $lookup: {
          from: 'areas',
          localField: 'states.$id',
          foreignField: '_id',
          as: 'areas_data',

        },

      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countries.$id',
          foreignField: '_id',
          as: 'countries_data',

        },

      },
      {
        "$lookup": {
          from: "interests_repo",
          as: "interests_repo_data",
          let: {
            "localID": "$userInterests.$id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$localID"]
                }
              }
            },
            {
              $project: {
                "interestName": 1,
                "icon": 1,

              }
            },

          ],

        },

      },
      {
        $lookup: {
          from: 'mediaproofpicts',
          localField: 'proofPict.$id',
          foreignField: '_id',
          as: 'mediaproofpicts_data',

        },

      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict.$id',
          foreignField: '_id',
          as: 'avatardata',

        },

      },
      {
        $addFields: {
          'avatar': {
            $arrayElemAt: ['$avatardata', 0]
          },

        }
      },
      {
        $lookup: {
          from: 'userbankaccounts',
          let: {
            "id": "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$id"]
                }
              }
            },
            {
              $project: {
                idBank: 1,
                noRek: 1,
                nama: 1,
                active: 1
              }
            }
          ],
          as: 'userbankaccounts_data'
        }
      },
      {
        $unwind: {
          path: "$userbankaccounts_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$mediaproofpicts_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "banks",
          localField: "userbankaccounts_data.idBank",
          foreignField: "_id",
          as: "userbankaccounts_data.bankName",

        }
      },
      {
        $project: {
          fullName: 1,
          username: {
            $arrayElemAt: ['$userauths_data.username', 0]
          },
          mobileNumber: 1,
          email: 1,
          createdAt: 1,
          status: 1,
          dob: 1,
          gender: 1,
          statusUser:
          {
            $cond: {
              if: {
                $eq: ["$isIdVerified", true]
              },
              then: "PREMIUM",
              else: "BASIC"
            }
          },
          mediaId: '$mediaproofpicts_data._id',
          tempatLahir: '$mediaproofpicts_data.tempatLahir',
          avatar: {

            mediaEndpoint: {
              "$concat": ["/profilepict/", "$avatar.mediaID"]
            },


          },
          insights: {
            followers: {
              $arrayElemAt: ['$insights_data.followers', 0]
            },
            followings: {
              $arrayElemAt: ['$insights_data.followings', 0]
            },

          },
          states: {
            $arrayElemAt: ['$areas_data.stateName', 0]
          },
          cities: {
            $arrayElemAt: ['$cities_data.cityName', 0]
          },
          countries: {
            $arrayElemAt: ['$countries_data.country', 0]
          },
          userbankaccounts: {
            _id: '$userbankaccounts_data._id',
            idBank: '$userbankaccounts_data.idBank',
            bankcode: {
              $arrayElemAt: ['$userbankaccounts_data.bankName.bankcode', 0]
            },
            bankname: {
              $arrayElemAt: ['$userbankaccounts_data.bankName.bankname', 0]
            },
            noRek: '$userbankaccounts_data.noRek',
            nama: '$userbankaccounts_data.nama',
            active: '$userbankaccounts_data.active'
          },
          interests: '$interests_repo_data',
          dokument: [{
            mediaproofpicts: {
              mediaId: '$mediaproofpicts_data._id',
              mediaBasePath: '$mediaproofpicts_data.mediaBasePath',
              mediaUri: '$mediaproofpicts_data.mediaUri',
              postType: '$mediaproofpicts_data.mediaType',
              mediaEndpoint: {
                $concat: ["proofpict", "/", '$mediaproofpicts_data._id']
              },

            },
            mediaSelfiepicts: {
              mediaId: '$mediaproofpicts_data._id',
              mediaBasePath: '$mediaproofpicts_data.mediaSelfieBasePath',
              mediaUri: '$mediaproofpicts_data.mediaSelfieUri',
              postType: '$mediaproofpicts_data.mediaSelfieType',
              mediaEndpoint: {
                $concat: ["selfiepict", "/", '$mediaproofpicts_data._id']
              },

            },
            mediaSupportfile: {
              mediaEndpoint: {

                $cond: {
                  if: {
                    $or: [{
                      $eq: ['$mediaproofpicts_data.SupportfsSourceUri', null]
                    }, {
                      $eq: ['$mediaproofpicts_data.SupportfsSourceUri', ""]
                    }, {
                      $eq: ['$mediaproofpicts_data.SupportfsSourceUri', []]
                    }, {
                      $eq: ['$mediaproofpicts_data.SupportfsSourceUri', {}]
                    }]
                  },
                  then: {},
                  else: '$mediaproofpicts_data.SupportfsSourceUri'
                },

              }
            }
          }],

        }
      },
      {
        $group: {
          _id: "$_id",
          fullName: {
            $first: "$fullName"
          },
          username: {
            $first: "$username"
          },
          email: {
            $first: "$email"
          },
          createdAt: {
            $first: "$createdAt"
          },
          status: {
            $first: "$status"
          },
          mediaId: {
            $first: "$mediaId"
          },
          dob: {
            $first: "$dob"
          },
          gender: {
            $first: "$gender"
          },
          insights: {
            $first: "$insights"
          },
          states: {
            $first: "$states"
          },
          cities: {
            $first: "$cities"
          },
          countries: {
            $first: "$countries"
          },
          interests: {
            $first: "$interests"
          },
          dokument: {
            $first: "$dokument"
          },
          userbankaccounts: {
            $push: "$userbankaccounts"
          },
          avatar: {
            $first: "$avatar"
          },
          mobileNumber: {
            $first: "$mobileNumber"
          },
          tempatLahir: {
            $first: "$tempatLahir"
          },
          statusUser: {
            $first: "$statusUser"
          },
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          mediaId: 1,
          email: 1,
          createdAt: 1,
          status: 1,
          placeofbirth: '-',
          dob: 1,
          gender: 1,
          insights: 1,
          states: 1,
          cities: 1,
          countries: 1,
          interests: 1,
          avatar: 1,
          mobileNumber: 1,
          tempatLahir: 1,
          statusUser: 1,
          dokument: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$dokument", null]
                }, {
                  $eq: ["$dokument", ""]
                }, {
                  $eq: ["$dokument", []]
                }]
              },
              then: [],
              else: "$dokument"
            },

          },
          userbankaccounts: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$userbankaccounts", null]
                }, {
                  $eq: ["$userbankaccounts", ""]
                }, {
                  $eq: ["$userbankaccounts", []]
                }]
              },
              then: [],
              else: "$userbankaccounts"
            },

          },

        }
      }
    ]);

    return query;
  }

  async getUserAssets(email: string) {
    return await this.userbasicModel.aggregate([
      {
        $match:
        {
          email: email
        }
      },
      {
        "$addFields": {
          localID_: [
            new mongoose.Types.ObjectId("63d21cdd783e42865d1075e8"),
            new mongoose.Types.ObjectId("63d226b63d6368c0921480f5")
          ]
        }
      },
      {
        $lookup: {
          from: "assetsfilter",
          let: {
            localID: "$localID_"
          },
          pipeline: [
            {
              $match: {
                _id: {
                  $nin: ["$$localID"]
                  // $nin: [
                  //   new mongoose.Types.ObjectId("63d21cdd783e42865d1075e8"),
                  //   new mongoose.Types.ObjectId("63d226b63d6368c0921480f5")
                  // ] 
                }
                // $expr: {
                //   $in: ["$_id", "$$localID"]
                // }
              }
            },
          ],
          "as": "user_assets"
        },

      },
    ])
  }

  async updateUserAssets(email: string, assets: mongoose.Types.ObjectId[]) {
    return this.userbasicModel.updateOne(
      { email: email },
      { $push: { userAssets: { $each: assets } } })
  }

  async userNew(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }
    var query = await this.userbasicModel.aggregate([
      {
        $match: {

          createdAt: {
            $gte: startdate,
            $lte: dt

          }
        }
      },
      {
        $group: {

          _id: {
            tgl: {
              $substrCP: ['$createdAt', 0, 10]
            },

          },
          count: {
            $sum: 1
          },

        },

      },
      {
        $project: {
          _id: 0,
          date: '$_id.tgl',
          count: 1
        }
      },

      {
        $sort: { date: 1 }
      }

    ]);
    return query;

  }

  async demografis(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }
    var query = await this.userbasicModel.aggregate([

      {
        $match: {

          createdAt: {
            $gte: startdate,
            $lte: dt

          }
        }
      },
      {
        $project: {
          createdAt: 1,
          email: 1,
          states: 1,
          gender: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$gender', 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },

          },

        }
      },
      {
        $facet: {
          "gender": [
            {
              $group: {

                _id: '$gender',
                count: {
                  $sum: 1
                },

              },

            },
            {
              $project: {
                _id: 0,
                gender: '$_id',
                count: 1,

              }
            },

          ],
          "wilayah": [
            {
              $lookup: {
                from: 'areas',
                localField: 'states.$id',
                foreignField: '_id',
                as: 'areas_data',

              },

            },

            {
              $project: {
                createdAt: 1,
                stateName: {
                  "$arrayElemAt": ['$areas_data.stateName', 0]
                },
              }
            },
            {
              $group: {

                _id: '$stateName',
                count: {
                  $sum: 1
                },

              },

            },
            {
              $project: {
                _id: 0,
                stateName: '$_id',
                count: 1,

              }
            },

          ]
        }
      }
    ]);
    return query;
  }

  async executeData(id_interst1: string, id_interst2: string) {
    return this.userbasicModel.findOneAndReplace(
      {
        "userInterests.$id": new mongoose.Types.ObjectId(id_interst1)
      },
      {
        "userInterests.$[element].$id": new mongoose.Types.ObjectId(id_interst2)
      },
      {
        arrayFilters: [{
          "element.$id": new mongoose.Types.ObjectId(id_interst1)
        }]
      }
    ).exec();
  }

  async getfriendListdata(page: number, limit: number) {
    var pipeline = [];

    pipeline.push(
      { $skip: page * limit },
      { $limit: limit },
      {
        "$lookup":
        {
          from: "userauths",
          as: "auth_data",
          let:
          {
            auth_fk: "$email"
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
                        "$email",
                        "$$auth_fk"
                      ]
                  }
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  username: 1
                }
              }
            ]
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          fullName: 1,
          username:
          {
            "$arrayElemAt":
              [
                "$auth_data.username", 0
              ]
          },
        }
      },
      {
        "$lookup":
        {
          from: "contentevents",
          as: "contentevents_data",
          let:
          {
            contentevents_fk: "$email"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$or":
                    [
                      {
                        "$and":
                          [
                            {
                              "$expr":
                              {
                                "$eq":
                                  [
                                    "$eventType", "FOLLOWING"
                                  ]
                              }
                            },
                            {
                              "$expr":
                              {
                                "$eq":
                                  [
                                    "$senderParty", "$$contentevents_fk"
                                  ]
                              }
                            },
                          ]
                      },
                      {
                        "$and":
                          [
                            {
                              "$expr":
                              {
                                "$eq":
                                  [
                                    "$eventType", "FOLLOWER"
                                  ]
                              }
                            },
                            {
                              "$expr":
                              {
                                "$eq":
                                  [
                                    "$receiverParty", "$$contentevents_fk"
                                  ]
                              }
                            },
                          ]
                      }
                    ]
                }
              },
              {
                "$group":
                {
                  _id: "$email",
                  total:
                  {
                    "$sum": 1
                  }
                }
              },
              {
                "$match":
                {
                  total:
                  {
                    "$gt": 1
                  }
                }
              },
              {
                "$sort":
                {
                  _id: 1
                }
              },
              {
                "$project":
                {
                  _id: 0,
                  email: "$_id"
                }
              }
            ]
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          fullName: 1,
          username: 1,
          totalfriend:
          {
            "$ifNull":
              [
                {
                  "$size": "$contentevents_data"
                },
                0
              ]
          },
          friendlist:
          {
            "$ifNull":
              [
                "$contentevents_data",
                []
              ]
          },
        }
      });

    // kalo seandainya mau dipake supaya tahu running time api yang menggunakan query ini
    // if(loop > 0)
    // {
    //   pipeline.push({
    //       "$skip":limit * loop
    //   });
    // }

    // if(limit > 0)
    // {
    //   pipeline.push({   
    //       "$limit":limit
    //   });
    // }

    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }
  async getcount() {
    var query = await this.userbasicModel.aggregate([
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  // async getuser(page: number, limit: number) {
  //   var pipeline = [];

  //   pipeline.push(
  //     {
  //       $match: {
  //         $or: [
  //           {
  //             'email': email
  //           },
  //           {
  //             'email': "ahmad.taslim07@gmail.com"
  //           },
  //         ]
  //       }
  //     },
  //     { $skip: page * limit },
  //     { $limit: limit },
  //   );
  //   var query = await this.userbasicModel.aggregate(pipeline);

  //   return query;
  // }

  async gettotalyopmail(skip: number, limit: number) {
    var pipeline = [];

    // pipeline.push(
    //   {
    //     "$match":
    //     {
    //       "email":
    //       {
    //         "$regex": "yopmail.com",
    //         "$options": "i"
    //       }
    //     }
    //   }
    // );

    if (skip != null && skip != undefined && skip > 0) {
      pipeline.push(
        {
          "$skip": skip * limit
        }
      );
    }

    if (limit != null && limit != undefined && limit > 0) {
      pipeline.push(
        {
          "$limit": limit
        }
      );
    }

    pipeline.push(
      {
        "$lookup":
        {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'userauth_data',
        },
      },
      {
        "$lookup":
        {
          from: 'languages',
          localField: 'languages.$id',
          foreignField: '_id',
          as: 'languages_data',
        },
      },
      {
        "$project":
        {
          email: 1,
          fullName: 1,
          languages:
          {
            "$ifNull":
              [
                {
                  "$arrayElemAt":
                    [
                      "$languages_data.langIso", 0
                    ]
                },
                "id"
              ]
          },
          username:
          {
            "$arrayElemAt":
              [
                "$userauth_data.username", 0
              ]
          },
          akunmati:
          {
            "$regexMatch":
            {
              input: "$email",
              regex: "noneactive",
              options: "i"
            }
          }
        }
      }
    );

    // console.log(JSON.stringify(pipeline));
    var result = await this.userbasicModel.aggregate(pipeline);

    return result;
  }

  async getpanggilanuser(page: number, limit: number) {
    var result = await this.userbasicModel.aggregate(
      [
        {
          "$skip": page * limit
        },
        {
          "$limit": limit
        },
        {
          "$lookup":
          {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'userauth_data',
          },
        },
        {
          "$project":
          {
            email: 1,
            fullName: 1,
            languages: 1,
            username:
            {
              "$arrayElemAt":
                [
                  "$userauth_data.username", 0
                ]
            },
            akunmati:
            {
              "$regexMatch":
              {
                input: "$email",
                regex: "noneactive",
                options: "i"
              }
            }
          }
        },
      ]
    );

    return result;
  }

  async getuser(page: number, limit: number) {
    var pipeline = [];

    pipeline.push(
      { $skip: page * limit },
      { $limit: limit },
    );
    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

  async updateuser(id: string, userBadge: any[]): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": new Types.ObjectId(id) },
      { $set: { "userBadge": userBadge } });
    return data;
  }

  async updatefilter(id: string, idarray: string, value: boolean) {
    return this.userbasicModel.findByIdAndUpdate(

      { _id: new Types.ObjectId(id) },
      {
        $set: {
          "userBadge.$[element].isActive": value,

        }
      },
      {
        arrayFilters: [{
          "element.idUserBadge": new Types.ObjectId(idarray)
        }]

      });
  }

  async updatefilterfalse(id: string, idarray: string, value: boolean) {
    return this.userbasicModel.findByIdAndUpdate(

      { _id: new Types.ObjectId(id) },
      {
        $set: {
          "userBadge.$[element].isActive": value,

        }
      },
      {
        arrayFilters: [{
          "element.idUserBadge": new Types.ObjectId(idarray)
        }]

      });
  }

  async findTopFive(param): Promise<any> {
    var aggregate = [];
    if (param == "INTEREST") {
      aggregate.push(
        {
          $unwind: {
            path: "$userInterests",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$userInterests",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            _id: 0,
            interest: {
              $cond: {
                if: {
                  $eq: ["$_id", null]
                },
                then: "Lainnya",
                else: "$_id.$id"
              }
            }
          }
        },
        {
          $lookup: {
            from: "interests_repo",
            as: "interests",
            let: {
              localID: '$interest'
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
            ]
          }
        },
        {
          $project: {
            _id: "$interest",
            interestName:
            {
              $cond: {
                if: {
                  $gt: [{ $size: "$interests" }, 0]
                },
                then: {
                  "$let": {
                    "vars": {
                      "tmp": { "$arrayElemAt": ["$interests", 0] },
                    },
                    "in": "$$tmp.interestName"
                  }
                },
                else: "Other",
              }
            },
            interestNameId:
            {
              $cond: {
                if: {
                  $gt: [{ $size: "$interests" }, 0]
                },
                then: {
                  "$let": {
                    "vars": {
                      "tmp": { "$arrayElemAt": ["$interests", 0] },
                    },
                    "in": "$$tmp.interestNameId"
                  }
                },
                else: "Lainnya",
              }
            },
          }
        },);
    } else if (param == "LOCATION") {
      aggregate.push(
        {
          $unwind: {
            path: "$states",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$states",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            _id: 0,
            location: {
              $cond: {
                if: {
                  $eq: ["$_id", null]
                },
                then: "Lainnya",
                else: "$_id.$id"
              }
            }
          }
        },
        {
          $lookup: {
            from: "areas",
            as: "areas",
            let: {
              localID: '$location'
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
            ]
          }
        },
        {
          $project: {
            _id: "$location",
            stateName:
            {
              $cond: {
                if: {
                  $gt: [{ $size: "$areas" }, 0]
                },
                then: {
                  "$let": {
                    "vars": {
                      "tmp": { "$arrayElemAt": ["$areas", 0] },
                    },
                    "in": "$$tmp.stateName"
                  }
                },
                else: "Other",
              }
            },
            stateID:
            {
              $cond: {
                if: {
                  $gt: [{ $size: "$areas" }, 0]
                },
                then: {
                  "$let": {
                    "vars": {
                      "tmp": { "$arrayElemAt": ["$areas", 0] },
                    },
                    "in": "$$tmp.stateID"
                  }
                },
                else: "Lainnya",
              }
            },
          }
        },
      );
    }
    const query = await this.userbasicModel.aggregate(aggregate);
    return query;
  }

  async findone_(email: string) {
    var query = await this.userbasicModel.aggregate([

      {
        $match: {
          email: email
        }
      },
      {
        $project: {

          "profileID": 1,
          "email": 1,
          "fullName": 1,
          "gender": 1,
          "status": 1,
          "event": 1,
          "isComplete": 1,
          "isCelebrity": 1,
          "isIdVerified": 1,
          "isPrivate": 1,
          "isFollowPrivate": 1,
          "isPostPrivate": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "insight": 1,
          "userInterests": 1,
          "userAuth": 1,
          "languages": 1,
          "_class": 1,
          "statusKyc": 1,
          "reportedUser": 1,
          "reportedUserHandle": 1,
          "listAddKyc": 1,
          "userAssets": 1,
          "__v": 1,
          "profilePict": 1,
          "bio": 1,
          "dob": 1,
          "mobileNumber": 1,
          "timeEmailSend": 1,
          "regSrc": 1,
          "icon": 1,
          "userBadge": 1,
          "countries": 1,
          "states": 1,
          "cities": 1,
          "idProofNumber": 1,
          "idProofStatus": 1,
          "pin": 1,
          "tutor": 1,
          "otppinVerified": 1,
          "creator":1,
          urluserBadge:
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
                  },
                },
                []
              ]
          },
        }
      },
      {
        $project: {

          "profileID": 1,
          "email": 1,
          "fullName": 1,
          "gender": 1,
          "status": 1,
          "event": 1,
          "isComplete": 1,
          "isCelebrity": 1,
          "isIdVerified": 1,
          "isPrivate": 1,
          "isFollowPrivate": 1,
          "isPostPrivate": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "insight": 1,
          "userInterests": 1,
          "userAuth": 1,
          "languages": 1,
          "_class": 1,
          "statusKyc": 1,
          "reportedUser": 1,
          "reportedUserHandle": 1,
          "listAddKyc": 1,
          "userAssets": 1,
          "__v": 1,
          "profilePict": 1,
          "bio": 1,
          "dob": 1,
          "mobileNumber": 1,
          "timeEmailSend": 1,
          "regSrc": 1,
          "icon": 1,
          "userBadge": 1,
          "countries": 1,
          "states": 1,
          "cities": 1,
          "idProofNumber": 1,
          "idProofStatus": 1,
          "pin": 1,
          "otppinVerified": 1,
          "tutor": 1,
          "creator":1,
          urluserBadge:
          {
            "$ifNull": [
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
      }
    ]);
    return query[0];
  }

  async updateTutor(email: string, key: string, value: boolean) {
    console.log(email)
    console.log(key)
    console.log(value)
    this.userbasicModel.updateOne({ 'tutor.key': key, email: email }, {
      '$set': {
        'tutor.$.status': value
      }
    },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  //async listkyc(keys: string, status: any[], startdate: string, enddate: string, descending: boolean, page: number, limit: number)
  async listkycsummary2(startdate: string, enddate: string, jenisquery: string, keys: string, status: any[], descending: boolean, page: number, limit: number) {
    var pipeline = [];
    var firstmatch = [];
    var order = null;

    firstmatch.push(
      {
        "$expr":
        {
          "$eq":
            [
              "$_id", "$$fk_id"
            ]
        }
      },
      {
        status: {
          $ne: null
        }
      },
      {

        status: {
          $ne: ""
        }
      },
    );

    if (startdate != null && startdate !== undefined) {
      var convertstart = startdate.split(" ")[0];
      
      firstmatch.push(
        {
          createdAt:
          {
            "$gte": convertstart
          }
        }
      );
    }

    if (enddate != null && enddate !== undefined) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
  
        var dateend = currentdate.toISOString().split("T")[0];
      } catch (e) {
        dateend = "";
      }
      
      firstmatch.push(
        {
          createdAt:
          {
            "$lt": dateend
          }
        }
      );
    }

    pipeline.push(
      {
        "$match":
        {
          proofPict:
          {
            "$exists": true
          }
        }
      },
      {
        "$project":
        {
          _id: 0,
          userId: "$_id",
          proofPict: "$proofPict.$id",
          email: 1,
          profilePict: "$profilePict.$id"
        }
      },
      {
        "$lookup":
        {
          from: "mediaproofpicts",
          as: "proof_data",
          let:
          {
            fk_id: "$proofPict"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$and": firstmatch
                }
              }
            ]
        }
      },
      {
        "$unwind":
        {
          path: "$proof_data"
        }
      },
      {
        "$lookup":
        {
          "from": "userauths",
          "localField": "email",
          "foreignField": "email",
          "as": "userAuth_data"
        }
      },
      {
        "$lookup": {
          "from": "mediaprofilepicts",
          "localField": "profilePict",
          "foreignField": "_id",
          "as": "profilePict_data"
        }
      },
      {
        "$project":
        {
          _id: "$proof_data._id",
          createdAt: "$proof_data.createdAt",
          idcardnumber: "$proof_data.idcardnumber",
          kycHandle: "$proof_data.kycHandle",
          email: 1,
          userId: 1,
          status: "$proof_data.status",
          jumlahPermohonan: "1",
          tahapan: "KTP",
          username:
          {
            "$arrayElemAt":
              [
                "$userAuth_data.username", 0
              ]
          },
          avatar:
          {
            "$arrayElemAt":
              [
                "$profilePict_data", 0
              ]
          }
        },
      },
      // {
      //   "$addFields":
      //   {
      //     "concat": "/profilepict",
      //     "pict": {
      //       "$replaceOne": {
      //         "input": "$avatar.mediaUri",
      //         "find": "_0001.jpeg",
      //         "replacement": ""
      //       }
      //     }
      //   }
      // },
      {
        "$project":
        {
          email: 1,
          username: 1,
          createdAt: 1,
          status:
          {
            "$switch": {
              "branches": [
                {
                  "case": {
                    "$eq": [
                      "$status",
                      "IN_PROGGRESS"
                    ]
                  },
                  "then": "BARU"
                },
                {
                  "case": {
                    "$eq": [
                      "$status",
                      "FAILED"
                    ]
                  },
                  "then": "DITOLAK"
                },
                {
                  "case": {
                    "$eq": [
                      "$status",
                      "FINISH"
                    ]
                  },
                  "then": "BYSYSTEM"
                },
                {
                  "case": {
                    "$eq": [
                      "$status",
                      "DISETUJUI"
                    ]
                  },
                  "then": "DISETUJUI"
                }
              ],
              "default": ""
            }
          },
          idcardnumber: 1,
          jumlahPermohonan: 1,
          tahapan: 1,
          kycHandle: 1,
          avatar:
          {
            mediaBasePath: "$avatar.mediaBasePath",
            mediaUri: "$avatar.mediaUri",
            mediaType: "$avatar.mediaType",
            "mediaEndpoint": {
              "$concat": ["/profilepict/", "$avatar.mediaID"]
            }

          }
        }
      },
    );

    if (jenisquery == 'summary') {
      pipeline.push(
        {
          "$group":
          {
            _id: "$status",
            myCount:
            {
              $sum: 1
            },
          }
        }
      );
    }
    else {
      if (keys != null && keys != undefined) {
        pipeline.push({
          $match: {

            username: {
              $regex: keys, $options: 'i'
            },
          }
        });
      }

      if (status != null && status !== undefined) {
        pipeline.push(
          {
            $match: {
              $or: [
                {
                  status: {
                    $in: status
                  }
                },

              ]
            }
          }
        );
      }

      if (descending === true) {
        order = -1;
      } else {
        order = 1;
      }

      pipeline.push(
        {
          $sort: {
            createdAt: order
          },
        }
      );

      if (page > 0) {
        pipeline.push({ $skip: (page * limit) });
      }

      if (limit > 0) {
        pipeline.push({ $limit: limit });
      }
    }

    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

  // async updateTutor(email: string, key: string, value: boolean) {
  //   console.log(email)
  //   console.log(key)
  //   console.log(value)
  //   this.userbasicModel.updateOne({ 'tutor.key': key, email: email }, {
  //     '$set': {
  //       'tutor.$.status': value
  //     }
  //   },
  //     function (err, docs) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log(docs);
  //       }
  //     },
  //   ).clone().exec();
  // }

  // async listkycsummary2(startdate: string, enddate: string, jenisquery: string, keys: string, status: any[], descending: boolean, page: number, limit: number) {
  //   try {
  //     var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

  //     var dateend = currentdate.toISOString();
  //   } catch (e) {
  //     dateend = "";
  //   }

  //   var pipeline = [];
  //   var firstmatch = [];
  //   var order = null;

  //   firstmatch.push(
  //     {
  //       "$expr":
  //       {
  //         "$eq":
  //           [
  //             "$_id", "$$fk_id"
  //           ]
  //       }
  //     },
  //     {
  //       status: {
  //         $ne: null
  //       }
  //     },
  //     {

  //       status: {
  //         $ne: ""
  //       }
  //     },
  //   );

  //   if (startdate != null && startdate !== undefined) {
  //     firstmatch.push(
  //       {
  //         createdAt:
  //         {
  //           "$gte": startdate
  //         }
  //       }
  //     );
  //   }

  //   if (enddate != null && enddate !== undefined) {
  //     firstmatch.push(
  //       {
  //         createdAt:
  //         {
  //           "$lte": dateend
  //         }
  //       }
  //     );
  //   }

  //   pipeline.push(
  //     {
  //       "$match":
  //       {
  //         proofPict:
  //         {
  //           "$exists": true
  //         }
  //       }
  //     },
  //     {
  //       "$project":
  //       {
  //         _id: 0,
  //         userId: "$_id",
  //         proofPict: "$proofPict.$id",
  //         email: 1,
  //         profilePict: "$profilePict.$id"
  //       }
  //     },
  //     {
  //       "$lookup":
  //       {
  //         from: "mediaproofpicts",
  //         as: "proof_data",
  //         let:
  //         {
  //           fk_id: "$proofPict"
  //         },
  //         pipeline:
  //           [
  //             {
  //               "$match":
  //               {
  //                 "$and": firstmatch
  //               }
  //             }
  //           ]
  //       }
  //     },
  //     {
  //       "$unwind":
  //       {
  //         path: "$proof_data"
  //       }
  //     },
  //     {
  //       "$lookup":
  //       {
  //         "from": "userauths",
  //         "localField": "email",
  //         "foreignField": "email",
  //         "as": "userAuth_data"
  //       }
  //     },
  //     {
  //       "$lookup": {
  //         "from": "mediaprofilepicts",
  //         "localField": "profilePict",
  //         "foreignField": "_id",
  //         "as": "profilePict_data"
  //       }
  //     },
  //     {
  //       "$project":
  //       {
  //         _id: "$proof_data._id",
  //         createdAt: "$proof_data.createdAt",
  //         idcardnumber: "$proof_data.idcardnumber",
  //         kycHandle: "$proof_data.kycHandle",
  //         email: 1,
  //         userId: 1,
  //         status: "$proof_data.status",
  //         jumlahPermohonan: "1",
  //         tahapan: "KTP",
  //         username:
  //         {
  //           "$arrayElemAt":
  //             [
  //               "$userAuth_data.username", 0
  //             ]
  //         },
  //         avatar:
  //         {
  //           "$arrayElemAt":
  //             [
  //               "$profilePict_data", 0
  //             ]
  //         }
  //       },
  //     },

  //     {
  //       "$project":
  //       {
  //         email: 1,
  //         username: 1,
  //         createdAt: 1,
  //         status:
  //         {
  //           "$switch": {
  //             "branches": [
  //               {
  //                 "case": {
  //                   "$eq": [
  //                     "$status",
  //                     "IN_PROGGRESS"
  //                   ]
  //                 },
  //                 "then": "BARU"
  //               },
  //               {
  //                 "case": {
  //                   "$eq": [
  //                     "$status",
  //                     "FAILED"
  //                   ]
  //                 },
  //                 "then": "DITOLAK"
  //               },
  //               {
  //                 "case": {
  //                   "$eq": [
  //                     "$status",
  //                     "FINISH"
  //                   ]
  //                 },
  //                 "then": "BYSYSTEM"
  //               },
  //               {
  //                 "case": {
  //                   "$eq": [
  //                     "$status",
  //                     "DISETUJUI"
  //                   ]
  //                 },
  //                 "then": "DISETUJUI"
  //               }
  //             ],
  //             "default": ""
  //           }
  //         },
  //         idcardnumber: 1,
  //         jumlahPermohonan: 1,
  //         tahapan: 1,
  //         kycHandle: 1,
  //         avatar:
  //         {
  //           mediaBasePath: "$avatar.mediaBasePath",
  //           mediaUri: "$avatar.mediaUri",
  //           mediaType: "$avatar.mediaType",
  //           "mediaEndpoint": {
  //             "$concat": ["/profilepict/", "$avatar.mediaID"]
  //           }

  //         }
  //       }
  //     },
  //   );

  //   if (jenisquery == 'summary') {
  //     pipeline.push(
  //       {
  //         "$group":
  //         {
  //           _id: "$status",
  //           myCount:
  //           {
  //             $sum: 1
  //           },
  //         }
  //       }
  //     );
  //   }
  //   else {
  //     if (keys != null && keys != undefined) {
  //       pipeline.push({
  //         $match: {

  //           username: {
  //             $regex: keys, $options: 'i'
  //           },
  //         }
  //       });
  //     }

  //     if (status != null && status !== undefined) {
  //       pipeline.push(
  //         {
  //           $match: {
  //             $or: [
  //               {
  //                 status: {
  //                   $in: status
  //                 }
  //               },

  //             ]
  //           }
  //         }
  //       );
  //     }

  //     if (descending === true) {
  //       order = -1;
  //     } else {
  //       order = 1;
  //     }

  //     pipeline.push(
  //       {
  //         $sort: {
  //           createdAt: order
  //         },
  //       }
  //     );

  //     if (page > 0) {
  //       pipeline.push({ $skip: (page * limit) });
  //     }

  //     if (limit > 0) {
  //       pipeline.push({ $limit: limit });
  //     }
  //   }

  //   var query = await this.userbasicModel.aggregate(pipeline);

  //   return query;
  // }

  async countuserchart() {
    var getmaledata = await this.userbasicModel.find({
      $or: [
        { gender: "MALE" },
        { gender: " MALE" },
        { gender: "Male" },
        { gender: "LAKI-LAKI" },
        { gender: "Laki-laki" },
        { gender: "Pria" },
      ]
    }).count();

    var getfemaledata = await this.userbasicModel.find({
      $or: [
        { gender: "FEMALE" },
        { gender: " FEMALE" },
        { gender: "Female" },
        { gender: "Perempuan" },
        { gender: " Perempuan" },
        { gender: "PEREMPUAN" },
        { gender: "Wanita" },
      ]
    }).count();

    var getotherdata = await this.userbasicModel.find({
      $or: [
        { gender: "" },
        { gender: null }
      ]
    }).count();

    var totaldata = await this.userbasicModel.aggregate([
      { $count: "myCount" }
    ]);

    var data = [
      {
        gender:
          [
            {
              "_id": "MALE",
              "count": getmaledata,
            },
            {
              "_id": "FEMALE",
              "count": getfemaledata,
            },
            {
              "_id": "OTHER",
              "count": getotherdata,
            },
          ],
        userActive: totaldata[0].myCount
      }
    ];

    return data;
  }

  async migrationRun(mingrionRun_: mingrionRun, _id:string){
    let countData = await this.userbasicModel.countDocuments();
    if (mingrionRun_.limitstop != undefined){
      if (mingrionRun_.limitstop >= mingrionRun_.limit) {
        if (countData >= mingrionRun_.limitstop) {
          countData = mingrionRun_.limitstop;
        } else {
          throw new BadRequestException({
            response_code: 400,
            messages: {
              info: ["Data User > Limit Stop"],
            },
          });
        }
      } else {
        throw new BadRequestException({
          response_code: 400,
          messages: {
            info: ["Limit stop > Limit"],
          },
        });
      }
    }
    console.log("countData",countData)
    if (mingrionRun_.limit != undefined) {
      let skip = 0;
      if (mingrionRun_.skip != undefined) {
        skip = mingrionRun_.skip;
      } 
      let limit = mingrionRun_.limit;
      let modulus = countData % limit;
      let dataLoop = 0;

      if (modulus == 0) {
        dataLoop = countData / limit;
      } else {
        dataLoop = (countData - modulus) / limit;
      }
      console.log("modulus", modulus)

      for (let i = 0; i < dataLoop; i++) {
        if (mingrionRun_.skip != undefined) {
          skip = mingrionRun_.skip;
        }else{
          skip = 0;
        }
        if (modulus == 0) {
          skip += i * mingrionRun_.limit;
        }else{
          if ((dataLoop - 1) == i) {
            skip += (i * mingrionRun_.limit) + modulus;
          } else {
            skip += i * mingrionRun_.limit;
          }
        }
        console.log("modulus userbasic", modulus)
        console.log("i userbasic", i)
        console.log("skip userbasic", skip)
        console.log("limit userbasic", limit)
        await this.migrtionQuery(mingrionRun_.out, skip, limit);
        console.log("migrtionQuery End userbasic")
      }
      console.log("-----------------------------------------FINISH-----------------------------------------");
      console.log("-------------PARAM-------------", JSON.stringify(mingrionRun_));
      let LogMigrations_ = new LogMigrations();
      LogMigrations_.finishAt = (await this.getDate()).dateString;
      LogMigrations_.status = "FINISH";
      this.logMigrationsService.update(_id,LogMigrations_);
    } else {
      await this.migrtionQuery();
      console.log("-----------------------------------------FINISH-----------------------------------------");
      console.log("-------------PARAM-------------", JSON.stringify(mingrionRun_));
      let LogMigrations_ = new LogMigrations();
      LogMigrations_.finishAt = (await this.getDate()).dateString;
      LogMigrations_.status = "FINISH";
      this.logMigrationsService.update(_id, LogMigrations_);
    }
  }

  async migrtionQuery(out?:string, skip?: number, limit?:number){
    let aggregate = [];
    aggregate.push({
      $sort: {
        createdAt: 1
      }
    });

    if ((skip != undefined) && (limit != undefined)) {
      aggregate.push(
        {
          $skip: skip
        },
        {
          $limit: limit
        },);
    }

    aggregate.push({
        "$lookup": {
          from: "userauths",
          as: "authUser",
          let: {
            localID: "$email"
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
          ],
        },
      },
      {
        $unwind: {
          path: "$authUser",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "referral",
          as: "referral",
          let: {
            localID: "$email"
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$parent', '$$localID']
                    }
                  },
                ]
              },
            },
            {
              $project: {
                "email": "$children",
                "active": 1,
                "verified": 1,
                "imei": 1,
                "createdAt": 1,
                "updatedAt": 1,
              }
            }
          ],
        },
      },
      {
        "$lookup": {
          from: "friend_list",
          as: "friend",
          let: {
            localID: "$email"
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
                "friendlist": 1,
              }
            }
          ],
        },
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$profilePict.$id'
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
                uploadSource: 1,
                mediaThumBasePath: 1,
                mediaThumName: 1,
                mediaThumUri: 1,
                postType: 1,
                "mediaEndpoint": {
                  "$concat": ["/profilepict/", "$mediaID"]
                }
              }
            }
          ],
        }
      },
      {
        $unwind: {
          path: "$avatar",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "cities",
          as: "city",
          let: {
            localID: '$cities.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', "$$localID"]
                }
              }
            },
            {
              $project: {
                "cityName": 1,
              }
            }
          ],
        }
      },
      {
        $unwind: {
          path: "$city",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "areas",
          as: "state",
          let: {
            localID: '$states.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', "$$localID"]
                }
              }
            },
            {
              $project: {
                "stateName": 1,

              }
            }
          ],
        }
      },
      {
        $unwind: {
          path: "$state",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "countries",
          as: "country",
          let: {
            localID: '$countries.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', "$$localID"]
                }
              }
            },
            {
              $project: {
                "country": 1,

              }
            }
          ],
        }
      },
      {
        $unwind: {
          path: "$country",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "languages",
          as: "bahasa",
          let: {
            localID: '$languages.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', "$$localID"]
                }
              }
            },
            {
              $project: {
                "lang": 1,
                "langIso": 1,
              }
            }
          ],
        }
      },
      {
        $unwind: {
          path: "$bahasa",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "follow",
          let: {
            localID: '$email'
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
                          $eq: ['$email', "$$localID"]
                        }
                      },
                      {
                        event: "ACCEPT"
                      },
                      {
                        active: true
                      },
                      {
                        eventType: "FOLLOWING"
                      },

                    ]
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$email', "$$localID"]
                        }
                      },
                      {
                        event: "ACCEPT"
                      },
                      {
                        active: true
                      },
                      {
                        eventType: "FOLLOWER"
                      },

                    ]
                  }
                ]
              }
            },
            {
              $project: {
                follower: {
                  $ifNull: ["$receiverParty", "$kancut"]
                },
                following: {
                  $ifNull: ["$senderParty", "$kancut"]
                },
              }
            },
          ],
        }
      },
      {
        "$lookup": {
          from: "activityevents",
          as: "eventUser",
          let: {
            localID: '$email'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$payload.email', "$$localID"]
                    }
                  },
                  {
                    parentActivityEventID: {
                      $ne: null
                    }
                  },
                  {
                    "activityType": "ENROL",
                  },

                ]
              }
            },
            {
              $project: {
                event: 1,
              }
            },
            {
              $sort: {
                createdAt: - 1
              }
            },
            {
              $limit: 1
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediaproofpicts",
          as: "ktp",
          let: {
            localID: '$proofPict.$id'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$_id', "$$localID"]
                    }
                  },
                ]
              }
            },
            {
              $project: {
                mediaproofpict: 1,
                valid: 1,
                idcardnumber: 1,
                postType: 1,
                proofpictUploadSource: 1,
                nama: 1,
                tempatLahir: 1,
                jenisKelamin: 1,
                alamat: 1,
                agama: 1,
                statusPerkawinan: 1,
                pekerjaan: 1,
                kewarganegaraan: 1,
                mediaSelfieType: 1,
                mediaSelfieBasePath: 1,
                mediaSelfieUri: 1,
                SelfieOriginalName: 1,
                SelfiefsSourceUri: 1,
                SelfiefsSourceName: 1,
                SelfiefsTargetUri: 1,
                SelfiemediaMime: 1,
                SelfieUploadSource: 1,
                mediaSupportUri: 1,
                SupportOriginalName: 1,
                SupportfsSourceUri: 1,
                SupportfsSourceName: 1,
                SupportfsTargetUri: 1,
                mediaSupportUriThumb: 1,
                kycHandle: 1,
                state: 1,
                status: 1,
                active: 1,
                mediaType: 1,
                mediaBasePath: 1,
                mediaUri: 1,
                originalName: 1,
                fsSourceUri: 1,
                fsSourceName: 1,
                fsTargetUri: 1,
                mediaMime: 1,
                tglLahir: 1,
              }
            },
          ],
        }
      },
      {
        $unwind: {
          path: "$ktp",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        $set:
        {
          cewek: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
        }
      },
      {
        $set:
        {
          cowok: ["MALE", " MALE", "Laki-laki", "Pria"]
        },

      },
      {
        $set:
        {
          guestMode: false,

        },
      },
      {
        $project: {
          kyc: [{
            mediaproofpict: "$ktp.mediaproofpict",
            valid: "$ktp.valid",
            idcardnumber: "$ktp.idcardnumber",
            postType: "$ktp.postType",
            proofpictUploadSource: "$ktp.proofpictUploadSource",
            nama: "$ktp.nama",
            tempatLahir: "$ktp.tempatLahir",
            jenisKelamin: "$ktp.jenisKelamin",
            alamat: "$ktp.alamat",
            agama: "$ktp.agama",
            statusPerkawinan: "$ktp.statusPerkawinan",
            pekerjaan: "$ktp.pekerjaan",
            kewarganegaraan: "$ktp.kewarganegaraan",
            mediaSelfieType: "$ktp.mediaSelfieType",
            mediaSelfieBasePath: "$ktp.mediaSelfieBasePath",
            mediaSelfieUri: "$ktp.mediaSelfieUri",
            SelfieOriginalName: "$ktp.SelfieOriginalName",
            SelfiefsSourceUri: "$ktp.SelfiefsSourceUri",
            SelfiefsSourceName: "$ktp.SelfiefsSourceName",
            SelfiefsTargetUri: "$ktp.SelfiefsTargetUri",
            SelfiemediaMime: "$ktp.SelfiemediaMime",
            SelfieUploadSource: "$ktp.SelfieUploadSource",
            mediaSupportUri: "$ktp.mediaSupportUri",
            SupportOriginalName: "$ktp.SupportOriginalName",
            SupportfsSourceUri: "$ktp.SupportfsSourceUri",
            SupportfsSourceName: "$ktp.SupportfsSourceName",
            SupportfsTargetUri: "$ktp.SupportfsTargetUri",
            mediaSupportUriThumb: "$ktp.mediaSupportUriThumb",
            kycHandle: "$ktp.kycHandle",
            state: "$ktp.state",
            status: "$ktp.status",
            active: "$ktp.active",
            mediaType: "$ktp.mediaType",
            mediaBasePath: "$ktp.mediaBasePath",
            mediaUri: "$ktp.mediaUri",
            originalName: "$ktp.originalName",
            fsSourceUri: "$ktp.fsSourceUri",
            fsSourceName: "$ktp.fsSourceName",
            fsTargetUri: "$ktp.fsTargetUri",
            mediaMime: "$ktp.mediaMime",
            tglLahir: "$ktp.tglLahir",

          }],
          userEvent: {
            $arrayElemAt: ["$eventUser.event", 0]
          },
          tester: "$follow",
          follower: "$follow.follower",
          following: "$follow.following",
          citiesName: "$city.cityName",
          statesName: "$state.stateName",
          countriesName: "$country.country",
          languagesLang: "$bahasa.lang",
          languagesLangIso: "$bahasa.langIso",
          "_id": 1,
          "profileID": 1,
          "email": 1,
          "emailLogin": "$email",
          "fullName": 1,
          "dob": 1,
          "gender":
          {
            $cond: {
              if: {
                $in: ["$gender", "$cowok"]
              },
              then: "Laki-laki",
              else:
              {
                $cond: {
                  if: {
                    $in: ["$gender", "$cewek"]
                  },
                  then: "Perempuan",
                  else: "Other"
                }
              },

            }
          },
          "status": 1,
          "event": 1,
          "idProofName": 1,
          "idProofStatus": 1,
          "isComplete": 1,
          "isCelebrity": 1,
          "isIdVerified": 1,
          "isPrivate": 1,
          "isFollowPrivate": 1,
          "isPostPrivate": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "bio": 1,
          "icon": 1,
          "statusKyc": 1,
          "profilePict": 1,
          "insight": 1,
          "userInterests": 1,
          "countries": 1,
          "languages": 1,
          "_class": 1,
          "mobileNumber": 1,
          "idProofNumber": 1,
          "listAddKyc": 1,
          "proofPict": 1,
          "_idAuth": "$authUser._id",
          "username": "$authUser.username",
          "password": "$authUser.password",
          "userID": "$authUser.userID",
          "isExpiryPass": "$authUser.isExpiryPass",
          "isEmailVerified": "$authUser.isEmailVerified",
          "oneTimePassword": "$authUser.oneTimePassword",
          "otpRequestTime": "$authUser.otpRequestTime",
          "otpAttempt": "$authUser.otpAttempt",
          "otpNextAttemptAllow": "$authUser.otpNextAttemptAllow",
          "location": "$authUser.location",
          "isEnabled": "$authUser.isEnabled",
          "isAccountNonExpired": "$authUser.isAccountNonExpired",
          "isAccountNonLocked": "$authUser.isAccountNonLocked",
          "isCredentialsNonExpired": "$authUser.isCredentialsNonExpired",
          "roles": "$authUser.roles",
          "authUsers.devices": "$authUser.devices",
          "authUsers._class": "$authUser._class",
          "authUsers.loginSource": "$authUser.loginSource",
          "authUsers.loginSrc": "$authUser.loginSrc",
          "_idAvatar": "$avatar._id",
          "mediaType": "$avatar.mediaType",
          "mediaBasePath": "$avatar.mediaBasePath",
          "mediaUri": "$avatar.mediaUri",
          "originalName": "$avatar.originalName",
          "fsSourceUri": "$avatar.fsSourceUri",
          "fsSourceName": "$avatar.fsSourceName",
          "fsTargetUri": "$avatar.fsTargetUri",
          "mediaEndpoint": "$avatar.mediaEndpoint",
          "otp_attemp": 1,
          "otp_expired_time": 1,
          "otp_pin": 1,
          "otp_request_time": 1,
          "otppinVerified": 1,
          "pin": 1,
          userAssets: 1,
          "cities": 1,
          "states": 1,
          tutor: 1,
          guestMode: 1,
          referral: 1,
          friend:
          {
            $arrayElemAt: [
              {
                $arrayElemAt: ["$friend.friendlist", 0]
              },
              0
            ]
          },
        }
      },
      {
        $merge: {
          into: "newUserBasics",
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "insert"
        }
      });
    // console.log("--------------------------------------------------------------------------------------------------")
    // console.log(JSON.stringify(aggregate));
    // console.log("--------------------------------------------------------------------------------------------------")
    await this.userbasicModel.aggregate(aggregate);
  }

  async getDate(): Promise<any> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    return {
      date: date,
      dateString: DateTime.substring(0, DateTime.lastIndexOf('.')),
    }
  }
}