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
        ]
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

  async listAll(parentEmail: string, fromDate?: string, toDate?: string, jenisakun?:any[], skip?: number, limit?: number) {
    let dataPipeline = [];
    dataPipeline.push({
      "$match": {
        "parent": parentEmail
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
        "$project": {
          parent: 1,
          children: 1,
          active: 1,
          verified: 1,
          imei: 1,
          createdAt: 1,
          updatedAt: 1,
          childFullName: {
            $arrayElemAt: ['$childData.fullName', 0]
          },
          childDOB: {
            $arrayElemAt: ['$childData.dob', 0]
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
                                "$childData.guestMode", 0
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
                                '$childData.isIdVerified', 0
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
          childAge: {
            "$ifNull": [
              {
                "$dateDiff": {
                  "startDate": {
                    $dateFromString: {
                      dateString: {
                        $arrayElemAt: ['$childData.dob', 0]
                      },
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
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ['$childData.gender', 0] }, 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },
            // $arrayElemAt: ['$childData.gender', 0]
          },
          childCity: {
            $arrayElemAt: ['$childData.citiesName', 0]
          },
          childState: {
            $arrayElemAt: ['$childData.statesName', 0]
          },
          childAvatar: {
            mediaBasePath: {
              $arrayElemAt: ['$childData.mediaBasePath', 0]
            },
            mediaUri: {
              $arrayElemAt: ['$childData.mediaUri', 0]
            },
            mediaEndpoint: {
              $arrayElemAt: ['$childData.mediaEndpoint', 0]
            }
          }
        }
      }
    )
    if (jenisakun && jenisakun !== undefined) {
      dataPipeline.push({
        "$match": {
          "jenis": {
            $in: jenisakun
          }
        }
      })
    }
    if (skip > 0) {
      dataPipeline.push({ $skip: skip });
    }
    if (limit > 0) {
      dataPipeline.push({ $limit: limit });
    }
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
