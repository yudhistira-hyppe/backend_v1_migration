import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReferralDto } from './dto/create-referral.dto';
import { Referral, ReferralDocument } from './schemas/referral.schema';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name, 'SERVER_FULL')
    private readonly referralModel: Model<ReferralDocument>,
  ) { }

  async create(CreateSagasDto: CreateReferralDto): Promise<Referral> {
    const createSagasDto = await this.referralModel.create(CreateSagasDto);
    return createSagasDto;
  }

  async findAll(): Promise<Referral[]> {
    return this.referralModel.find().exec();
  }

  async findAllByParentChildren(parent: string, children: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, children: children }).exec();
  }

  async findAllByParent(parent: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, verified: true }).exec();
  }

  async findAllByChildren(children: string): Promise<Referral[]> {
    return this.referralModel.find({ children: children }).exec();
  }

  async findPendingStatusByChildren(children: string): Promise<Referral[]> {
    return this.referralModel.find({ children: children, status:"PENDING" }).exec();
  }

  async newlisting(email:string): Promise<Referral[]> 
  {
    return this.referralModel.find(
      {
        "parent":email,
        "$or":
        [
          {
            "status":null
          },
          {
            "status":"ACTIVE"
          },
        ],
        "children":
        {
          "$ne":email
        }
      }
    );
  }

  async findbyparent(parent: string): Promise<Referral> {
    return this.referralModel.findOne({ parent: parent }).exec();
  }

  async findOne(id: string): Promise<Referral> {
    return this.referralModel.findOne({ _id: id }).exec();
  }

  async findOneInChild(email: string): Promise<Referral> {
    return this.referralModel.findOne({ children: email }).exec();
  }

  async findOneInChildParent(user_email_children: string, user_email_parent: string): Promise<Referral> {
    return this.referralModel.findOne({ children: user_email_parent, parent: user_email_children }).exec();
  }

  async findOneInIme(imei: string): Promise<Referral> {
    return this.referralModel.findOne({ imei: imei }).exec();
  }

  async checkBothparentandChild(parent:string, child:string): Promise<Referral[]> {
    return this.referralModel.find({
      "$or":
      [
        {
          "$and":
          [
            {
              "parent":parent
            },
            {
              "parent":child
            },
          ]
        },
        {
          "$and":
          [
            {
              "parent":child
            },
            {
              "parent":parent
            },
          ]
        }
      ]
    }).exec();
  }

  async updateOne(id: string, updatedata: CreateReferralDto): Promise<Referral> {
      let data = await this.referralModel.findByIdAndUpdate(id, updatedata, { new: true });
      if (!data) {
          throw new Error('Data is not found!');
      }
      return data;
  }

  async delete(id: string) {
    const deletedCat = await this.referralModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async listAll(parentEmail: string, fromDate?: string, toDate?: string, jenisakun?:any[], username?: string, skip?: number, limit?: number) {
    let dataPipeline = [];
    dataPipeline.push({
      "$match": {
        "$and":[
          {
            "parent":parentEmail
          },
          {
            "$or":
            [
              {
                "status":null
              },
              {
                "status":"ACTIVE"
              },
            ]
          },
          {
            "children":
            {
              "$ne":parentEmail
            }
          }
        ]
      }
    })
    if (fromDate && fromDate !== undefined) {
      dataPipeline.push({
        "$match": {
          "createdAt": {
            $gte: fromDate + " 00:00:00"
          }
        }
      })
    }
    if (toDate && toDate !== undefined) {
      dataPipeline.push({
        "$match": {
          "createdAt": {
            $lte: toDate + " 23:59:59"
          }
        }
      })
    }
    dataPipeline.push(
      {
        "$sort": {
          "createdAt": -1
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          localField: "children",
          foreignField: "email",
          as: "childData"
        }
      },
      {
        "$unwind":
        {
          path:"$childData"
        }
      },
      {
        "$project": {
          parent: 1,
          children: 1,
          active: 1,
          verified: 1,
          imei: 1,
          createdAt: 1,
          updatedAt: 1,
          childUsername: '$childData.username',
          childFullName: '$childData.fullName',
          childDOB: '$childData.dob',
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
                          "$childData.guestMode",
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
                          '$childData.isIdVerified',
                          true
                        ]
                    },
                    then: "PREMIUM"
                  },
                ],
              default: "BASIC"
            }
          },
          childAge: {
            "$ifNull": [
              {
                "$dateDiff": {
                  "startDate": {
                    $dateFromString: {
                      dateString: '$childData.dob',
                      onError: null
                    }
                  },
                  "endDate": "$$NOW",
                  "unit": "year"
                }
              },
              null
            ]
          },
          childGender: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$childData.gender', 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$childData.gender', 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },
            // $arrayElemAt: ['$childData.gender', 0]
          },
          childCity: '$childData.citiesName',
          childState: '$childData.statesName',
          childAvatar: {
            mediaBasePath: '$childData.mediaBasePath',
            mediaUri: '$childData.mediaUri',
            mediaEndpoint: '$childData.mediaEndpoint',
          }
        }
      }
    )

    var matchingdata = [];
    if (jenisakun && jenisakun !== undefined) {
      matchingdata.push({
          "jenis": {
            $in: jenisakun
          }
      })
    }
    if (username && username !== undefined) {
      matchingdata.push({
          "$or":
          [
            {
              "children":
              {
                "$regex":username,
                "$options":"i"
              }
            },
            {
              "childUsername":
              {
                "$regex":username,
                "$options":"i"
              }
            },
          ]
      })
    }
    if(matchingdata.length != 0) {
      dataPipeline.push({
        "$match":{
          "$and":matchingdata
        }
      });
    }
    if (skip > 0) {
      dataPipeline.push({ $skip: skip });
    }
    if (limit > 0) {
      dataPipeline.push({ $limit: limit });
    }
    // var util=require('util');
    // console.log(util.inspect(dataPipeline, {depth:null, showHidden:false}));
    let data = await this.referralModel.aggregate([
      {
        "$facet": {
          total: [
            {
              "$match": {
                "parent": parentEmail
              }
            },
            {
              "$group": {
                _id: "$parent",
                total: {
                  $sum: 1
                }
              }
            }
          ],
          data: dataPipeline
        }
      },
      {
        "$project": {
          total: {
            $arrayElemAt: ['$total.total', 0]
          },
          data: 1
        }
      }
    ])
    return data;
  }
}
