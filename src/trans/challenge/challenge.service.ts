import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Challenge, challengeDocument } from './schemas/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Pipeline } from 'ioredis';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name, 'SERVER_FULL')
    private readonly ChallengeModel: Model<challengeDocument>,
  ) { }

  async create(Challenge_: CreateChallengeDto) {
    const _Challenge_ = await this.ChallengeModel.create(Challenge_);
    return _Challenge_;
  }

  async findAll(namachallenge: string, menuChallenge: string, startdate: string, enddate: string, objectchallenge: any[], statuschallenge: any[], caragabung: any[], ascending: boolean, page: number, limit: number) {
    var pipeline = [];

    pipeline.push(
      {
        $set: {
          "timenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), - 61200000] // 1 hari 61200000
              }
            }
          }
        }
      }
    );

    var firstmatch = [];

    if (namachallenge != null && namachallenge != undefined) {
      firstmatch.push(
        {
          "nameChallenge":
          {
            "$regex": namachallenge,
            "$options": "i"
          }
        },
      );
    }

    if (startdate != null && enddate != undefined) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

        var dateend = currentdate.toISOString().split("T")[0];
      } catch (e) {
        dateend = "";
      }

      firstmatch.push(
        {
          "$expr":
          {
            "$gte":
              [
                "$createdAt",
                startdate
              ]
          }
        },
        {
          "$expr":
          {
            "$lte":
              [
                "$createdAt",
                dateend
              ]
          }
        }
      );
    }

    if (objectchallenge != null && objectchallenge != undefined) {
      var konversiobject = objectchallenge.toString().split(",");
      firstmatch.push(
        {
          "$expr":
          {
            "$in":
              [
                "$objectChallenge", konversiobject
              ]
          }
        }
      );
    }

    if (caragabung != null && caragabung != undefined) {
      var konversigabung = caragabung.toString().split(",");
      firstmatch.push(
        {
          "$expr":
          {
            "$in":
              [
                {
                  "$arrayElemAt":
                    [
                      "$peserta.caraGabung", 0
                    ]
                },
                konversigabung
              ]
          }
        },
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

    pipeline.push(
      {
        $lookup:
        {
          from: "jenisChallenge",
          localField: "jenisChallenge",
          foreignField: "_id",
          as: "jenisChallenge_fk"
        }
      },
      {
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge_fk:
          {
            "$arrayElemAt":
              [
                "$jenisChallenge_fk.name", 0
              ]
          },
          caragabung:
          {
            "$arrayElemAt":
              [
                "$peserta.caraGabung", 0
              ]
          },
          statuscurrentChallenge:
          {
            "$switch":
            {
              branches:
                [
                  {
                    case:
                    {
                      "$and":
                        [
                          {
                            "$gte": ["$timenow", "$startChallenge"]
                          },
                          {
                            "$lte": ["$timenow", "$endChallenge"]
                          },
                        ]
                    },
                    then: "SEDANG BERJALAN"
                  },
                  {
                    case:
                    {
                      "$and":
                        [
                          {
                            "$gt": ["$timenow", "$endChallenge"]
                          },
                        ]
                    },
                    then: "SELESAI"
                  },
                ],
              default: "AKAN DATANG"
            }
          },
          bannerLeaderboard:
          {
            "$arrayElemAt":
              [
                "$leaderBoard.bannerLeaderboard", 0
              ]
          },
          statusChallenge: 1,
          objectChallenge: 1,
          startChallenge: 1,
          endChallenge: 1,
          createdAt: 1
        }
      },
    );

    if (menuChallenge != null && menuChallenge != undefined) {
      if (menuChallenge == 'DRAFT') {
        pipeline.push(
          {
            "$match":
            {
              "$expr":
              {
                "$eq":
                  [
                    "$statusChallenge", 'DRAFT'
                  ]
              }
            }
          }
        );
      }
      else {
        pipeline.push(
          {
            "$match":
            {
              "$and":
                [
                  {
                    "$expr":
                    {
                      "$eq":
                        [
                          "$jenisChallenge_fk", menuChallenge
                        ]
                    }
                  },
                  {
                    "$expr":
                    {
                      "$ne":
                        [
                          "$statusChallenge", 'DRAFT'
                        ]
                    }
                  },
                  {
                    "$expr":
                    {
                      "$ne":
                        [
                          "$statusChallenge", 'NONACTIVE'
                        ]
                    }
                  },
                ]
            }
          }
        );
      }
    }

    if (statuschallenge != null && statuschallenge != undefined) {
      var konversistatus = statuschallenge.toString().split(",");
      pipeline.push(
        {
          "$match":
          {
            "$expr":
            {
              "$in":
                [
                  "$statuscurrentChallenge", konversistatus
                ]
            }
          }
        }
      );
    }

    if (page > 0) {
      pipeline.push({
        "$skip": limit * page
      });
    }

    if (limit > 0) {
      pipeline.push({
        "$limit": limit
      });
    }

    if (ascending != null) {
      var setascending = null;
      if (ascending == true) {
        setascending = 1;
      }
      else {
        setascending = -1;
      }

      pipeline.push({
        "$sort":
        {
          "createdAt": setascending
        }
      });
    }

    // console.log(JSON.stringify(pipeline));

    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async findOne(id: string): Promise<Challenge> {
    return this.ChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async findlistingBanner(targetbanner: string): Promise<Challenge[]> {
    var pipeline = [];
    pipeline.push({
      "$set": {
        "timenow": {
          "$dateToString": {
            "format": "%Y-%m-%d %H:%M:%S",
            "date": {
              "$add": [
                new Date(),
                -61200000
              ]
            }
          }
        }
      }
    },
      {
        "$match":
        {
          "$and":
            [
              {
                "$expr":
                {
                  "$lte":
                    [
                      "$startChallenge",
                      "$timenow"
                    ]
                }
              },
              {
                "$expr":
                {
                  "$gte":
                    [
                      "$endChallenge",
                      "$timenow"
                    ]
                }
              },
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$statusChallenge",
                      "PUBLISH"
                    ]
                }
              }
            ]
        }
      });

    var projectdata = {
      _id: 1,
      nameChallenge: 1,
      createdAt: 1,
      startChallenge: 1,
      endChallenge: 1,
      statusChallenge: 1,
    };

    if (targetbanner == 'search') {
      projectdata['bannerLandingpage'] = {
        "$arrayElemAt":
          [
            "$bannerSearch.image",
            0
          ]
      }
    }
    else if (targetbanner == 'popup') {
      projectdata['bannerLandingpage'] = {
        "$arrayElemAt":
          [
            "$popUp.image",
            0
          ]
      }
    }

    pipeline.push({
      "$project": projectdata
    });

    // console.log(JSON.stringify(pipeline));

    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async find(): Promise<Challenge[]> {
    return this.ChallengeModel.find().exec();
  }

  async update(id: string, Challenge_: Challenge): Promise<Challenge> {
    let data = await this.ChallengeModel.findByIdAndUpdate(id, Challenge_, { new: true });
    if (!data) {
      throw new Error('Data is not found!');
    }
    return data;
  }

  async delete(id: string) {
    const data = await this.ChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
    return data;
  }
  async challengeReferal() {
    var query = await this.ChallengeModel.aggregate([

      { $match: { "statusChallenge": "PUBLISH" } },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "AktivitasAkun": {
            $arrayElemAt: ['$metrik.AktivitasAkun', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "poinReferal": {
            $arrayElemAt: ['$AktivitasAkun.Referal', 0]
          },
          "poinFollow": {
            $arrayElemAt: ['$AktivitasAkun.Ikuti', 0]
          },

        }
      },
      {
        $match: { "poinReferal": { $ne: null } }
      }
    ]);
    return query;
  }

  async challengeFollow() {
    var query = await this.ChallengeModel.aggregate([

      { $match: { "statusChallenge": "PUBLISH" } },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "AktivitasAkun": {
            $arrayElemAt: ['$metrik.AktivitasAkun', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "poinReferal": {
            $arrayElemAt: ['$AktivitasAkun.Referal', 0]
          },
          "poinFollow": {
            $arrayElemAt: ['$AktivitasAkun.Ikuti', 0]
          },

        }
      },
      {
        $match: { "poinFollow": { $ne: null } }
      }
    ]);
    return query;
  }

  async challengeKonten() {
    var pipeline = [];

    pipeline.push({
      $match: {
        "statusChallenge": "PUBLISH"
      }
    },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "InteraksiKonten": {
            $arrayElemAt: ['$metrik.InteraksiKonten', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "InteraksiKonten": 1,

        }
      },
      {
        $match: {
          "InteraksiKonten": {
            $ne: []
          },
          "Interaksi": true
        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "tagar": {
            $arrayElemAt: ['$InteraksiKonten.tagar', 0]
          },
          "buatKonten": {
            $arrayElemAt: ['$InteraksiKonten.buatKonten', 0]
          },
          "suka": {
            $arrayElemAt: ['$InteraksiKonten.suka', 0]
          },
          "tonton": {
            $arrayElemAt: ['$InteraksiKonten.tonton', 0]
          },
        }
      },);
    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }
}