import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Challenge, challengeDocument } from './schemas/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UserbadgeService } from '../userbadge/userbadge.service';
import { subChallengeService } from './subChallenge.service';
import { Userbadge } from '../userbadge/schemas/userbadge.schema';
import { CreateSubChallengeDto } from './dto/create-subchallenge.dto';
import { notifChallenge } from './schemas/notifChallenge.schema';
import { notifChallengeService } from './notifChallenge.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { LanguagesService } from '../../infra/languages/languages.service';
import { UserchallengesService } from '../userchallenges/userchallenges.service';
import { BadgeService } from '../badge/badge.service';
import { Pipeline } from 'ioredis';
import { NotificationsService } from "src/content/notifications/notifications.service";
import { UserbasicnewService } from '../../trans/userbasicnew/userbasicnew.service';
@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name, 'SERVER_FULL')
    private readonly ChallengeModel: Model<challengeDocument>,
    private readonly userbadgeService: UserbadgeService,
    private readonly subchallenge: subChallengeService,
    private readonly notifChallengeService: notifChallengeService,
    private readonly util: UtilsService,
    private readonly userbasicsSS: UserbasicsService,
    private readonly languagesService: LanguagesService,
    private readonly UserchallengesService: UserchallengesService,
    private readonly BadgeService: BadgeService,
    private readonly NotificationsService: NotificationsService,
    private readonly UserbasicnewService: UserbasicnewService,
  ) { }

  async create(Challenge_: CreateChallengeDto) {
    const _Challenge_ = await this.ChallengeModel.create(Challenge_);
    return _Challenge_;
  }

  async findAll(namachallenge: string, menuChallenge: string, startdate: string, enddate: string, objectchallenge: any[], statuschallenge: any[], caragabung: any[], ascending: boolean, page: number, limit: number) {
    var pipeline = [];

    var firstmatch = [];

    firstmatch.push(
      {
        "statusChallenge":
        {
          "$ne": "NONEACTIVE"
        }
      },
      {
        "statusChallenge":
        {
          "$ne": "NONACTIVE"
        }
      },
    );

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
        $set: {
          "timenow":
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
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge: 1,
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
                            "$gte": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$startChallenge",
                                    " ",
                                    "$startTime"
                                  ]
                              }
                            ]
                          },
                          {
                            "$lte": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$endChallenge",
                                    " ",
                                    "$endTime"
                                  ]
                              }
                            ]
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
                            "$gt": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$endChallenge",
                                    " ",
                                    "$endTime"
                                  ]
                              }
                            ]
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
          createdAt: 1,
          updatedAt: 1
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
        var mongo = require('mongoose');
        var convertid = mongo.Types.ObjectId(menuChallenge);
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
                          "$jenisChallenge", convertid
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
                  {
                    "$expr":
                    {
                      "$ne":
                        [
                          "$statusChallenge", 'NONEACTIVE'
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
          "updatedAt": setascending
        }
      });
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

    // console.log(JSON.stringify(pipeline));

    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async findOne(id: string): Promise<Challenge> {
    return this.ChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async detailchallenge(id: string) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(id);

    var query = await this.ChallengeModel.aggregate([
      {
        "$match":
        {
          _id: konvertid
        }
      },
      {
        "$lookup":
        {
          from: "jenisChallenge",
          as: "jenischallenge_data",
          let:
          {
            jenis_challenge_fk: "$jenisChallenge"
          },
          pipeline: [
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
                            "$$jenis_challenge_fk", "$_id"
                          ]
                      }
                    },
                  ]
              }
            },
            {
              "$project":
              {
                _id: 0,
                name: 1,
              }
            }
          ]
        }
      },
      {
        "$lookup":
        {
          from: "userChallenge",
          as: "userChallenge_data",
          let:
          {
            userChallenge_fk: "$_id"
          },
          pipeline: [
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
                            "$$userChallenge_fk", "$idChallenge"
                          ]
                      }
                    },
                  ]
              }
            },
            {
              "$group":
              {
                _id: "$idSubChallenge",
                total:
                {
                  "$sum": 1
                }
              }
            },
            {
              "$lookup":
              {
                from: "subChallenge",
                as: "subChallenge_data",
                let:
                {
                  subChallenge_fk: "$_id"
                },
                pipeline: [
                  {
                    "$match":
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$$subChallenge_fk", "$_id"
                          ]
                      }
                    }
                  },
                  {
                    "$project":
                    {
                      _id: 1,
                      session: 1,
                      startDatetime: 1,
                      endDatetime: 1,
                    }
                  }
                ]
              }
            },
            {
              "$project":
              {
                _id: 1,
                total: 1,
                startDatetime:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.startDatetime", 0
                    ]
                },
                endDatetime:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.endDatetime", 0
                    ]
                },
                session:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.session", 0
                    ]
                }
              }
            },
            {
              "$sort":
              {
                session: 1
              }
            }
          ]
        }
      },
      {
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge: 1,
          jenisChallengeName:
          {
            "$arrayElemAt":
              [
                "$jenischallenge_data.name", 0
              ]
          },
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          totaldurasi:
          {
            "$multiply":
              [
                "$durasi",
                "$jumlahSiklusdurasi"
              ]
            // "$dateDiff":
            // {
            //     startDate:
            //     {
            //         "$toDate":"$startChallenge",
            //     },
            //     endDate:
            //     {
            //         "$toDate":"$endChallenge",
            //     },
            //     unit:"day"
            // }
          },
          durasi: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime:
          {
            "$concat":
              [
                "$startChallenge",
                " ",
                "$startTime",
              ]
          },
          endTime:
          {
            "$concat":
              [
                "$endChallenge",
                " ",
                "$endTime",
              ]
          },
          jumlahSiklusdurasi: 1,
          tampilStatusPengguna: 1,
          objectChallenge: 1,
          statusChallenge: 1,
          metrik: 1,
          peserta: 1,
          leaderBoard: 1,
          ketentuanHadiah: 1,
          hadiahPemenang: 1,
          bannerSearch: 1,
          popUp: 1,
          notifikasiPush: 1,
          session: "$userChallenge_data",
          juara1:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara1"
                  }
                },
                null
              ]
          },
          juara2:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara2"
                  }
                },
                null
              ]
          },
          juara3:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara3"
                  }
                },
                null
              ]
          },
          // listParticipant:1
        }
      },
      {
        "$lookup":
        {
          from: "badge",
          as: "badge_data",
          let:
          {
            juara1: "$juara1",
            juara2: "$juara2",
            juara3: "$juara3",
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$in":
                      [
                        "$_id", ["$$juara1", "$$juara2", "$$juara3"]
                      ]
                  }
                }
              },
              {
                "$sort":
                {
                  type: 1
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  type: 1,
                  badgeProfile: 1,
                  badgeOther: 1
                }
              }
            ]
        }
      },
      {
        "$lookup":
        {
          from: "areas",
          as: "areas_data",
          let:
          {
            listarea:
            {
              "$arrayElemAt":
                [
                  "$peserta.lokasiPengguna",
                  0
                ]
            },
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$in":
                      [
                        "$_id", "$$listarea"
                      ]
                  }
                }
              },
              {
                "$group":
                {
                  _id: null,
                  data:
                  {
                    "$push":
                    {
                      _id: "$_id",
                      stateName: "$stateName"
                    }
                  }
                }
              }
            ]
        }
      },
      {
        $set: {
          "timenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [
                  new Date(), 25200000
                ]
              }
            }
          }
        }
      },
      {
        "$unwind":
        {
          path: "$notifikasiPush"
        }
      },
      {
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge: 1,
          jenisChallengeName: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          durasi: 1,
          totaldurasi: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          jumlahSiklusdurasi: 1,
          tampilStatusPengguna: 1,
          objectChallenge: 1,
          statusChallenge: 1,
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
                            "$gte": [
                              "$timenow",
                              "$startTime"
                            ]
                          },
                          {
                            "$lte": [
                              "$timenow",
                              "$endTime"
                            ]
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
                            "$gt": [
                              "$timenow",
                              "$endTime",
                            ]
                          },
                        ]
                    },
                    then: "SELESAI"
                  },
                ],
              default: "AKAN DATANG"
            }
          },
          metrik: 1,
          leaderBoard: 1,
          ketentuanHadiah:
            [
              {
                badgePemenang:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.badgePemenang",
                      0
                    ]
                },
                Height:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.Height",
                      0
                    ]
                },
                Width:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.Width",
                      0
                    ]
                },
                maxSize:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.maxSize",
                      0
                    ]
                },
                minSize:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.minSize",
                      0
                    ]
                },
                formatFile:
                {
                  "$arrayElemAt":
                    [
                      "$ketentuanHadiah.formatFile",
                      0
                    ]
                },
                badge:
                {
                  "$cond":
                  {
                    if:
                    {
                      "$eq":
                        [
                          {
                            "$arrayElemAt":
                              [
                                "$ketentuanHadiah.badgePemenang",
                                0
                              ]
                          },
                          false
                        ]
                    },
                    then: [],
                    else: [
                      {
                        juara1:
                        {
                          "$cond":
                          {
                            if:
                            {
                              "$eq":
                                [
                                  "$juara1", null
                                ]
                            },
                            then: "$$REMOVE",
                            else: "$juara1"
                          }
                        },
                        juara1_general:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeOther",
                              0
                            ]
                        },
                        juara1_profile:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeProfile",
                              0
                            ]
                        },
                        juara2:
                        {
                          "$cond":
                          {
                            if:
                            {
                              "$eq":
                                [
                                  "$juara2", null
                                ]
                            },
                            then: "$$REMOVE",
                            else: "$juara2"
                          }
                        },
                        juara2_general:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeOther",
                              1
                            ]
                        },
                        juara2_profile:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeProfile",
                              1
                            ]
                        },
                        juara3:
                        {
                          "$cond":
                          {
                            if:
                            {
                              "$eq":
                                [
                                  "$juara3", null
                                ]
                            },
                            then: "$$REMOVE",
                            else: "$juara3"
                          }
                        },
                        juara3_general:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeOther",
                              2
                            ]
                        },
                        juara3_profile:
                        {
                          "$arrayElemAt":
                            [
                              "$badge_data.badgeProfile",
                              2
                            ]
                        },
                      },
                    ]
                  }
                },
              }
            ],
          peserta:
            [
              {
                tipeAkunTerverikasi:
                {
                  "$arrayElemAt":
                    [
                      "$peserta.tipeAkunTerverikasi", 0
                    ]
                },
                statusTipeAkunTerverifikasi:
                {
                  "$switch":
                  {
                    branches: [
                      {
                        case:
                        {
                          "$eq":
                            [
                              {
                                "$arrayElemAt":
                                  [
                                    "$peserta.tipeAkunTerverikasi", 0
                                  ]
                              },
                              "YES"
                            ]
                        },
                        then: "KYC"
                      },
                      {
                        case:
                        {
                          "$eq":
                            [
                              {
                                "$arrayElemAt":
                                  [
                                    "$peserta.tipeAkunTerverikasi", 0
                                  ]
                              },
                              "NO"
                            ]
                        },
                        then: "Non E-KYC"
                      },
                    ],
                    default: "KYC & Non E-KYC"
                  }
                },
                caraGabung:
                {
                  "$arrayElemAt":
                    [
                      "$peserta.caraGabung", 0
                    ]
                },
                "jenisKelamin":
                {
                  "$arrayElemAt":
                    [
                      "$peserta.jenisKelamin", 0
                    ]
                },
                // "lokasiPengguna": 
                // {
                //     "$arrayElemAt":
                //     [
                //         "$peserta.lokasiPengguna", 0
                //     ]
                // },
                "lokasiPengguna":
                {
                  "$arrayElemAt":
                    [
                      "$areas_data.data", 0
                    ]
                },
                "rentangUmur":
                {
                  "$arrayElemAt":
                    [
                      "$peserta.rentangUmur", 0
                    ]
                },
              }
            ],
          hadiahPemenang: 1,
          bannerSearch: 1,
          popUp: 1,
          // notifikasiPush:1,
          notifikasiPush: [
            {
              "akanDatang": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.unit", 0
                      ]
                  },
                  "aturWaktu":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.akanDatang.aturWaktu", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.akanDatang.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$lt":
                              [
                                "$timenow",
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add":
                                        [
                                          {
                                            $dateFromString:
                                            {
                                              dateString: '$startTime'
                                            },
                                          },
                                          {
                                            "$multiply":
                                              [
                                                {
                                                  "$toInt":
                                                  {
                                                    "$arrayElemAt":
                                                      [
                                                        "$notifikasiPush.akanDatang.aturWaktu",
                                                        0
                                                      ]
                                                  }
                                                },
                                                3600000
                                              ]
                                          }
                                        ]
                                    }
                                  }
                                }
                              ]
                          },
                          then: "AKAN DATANG",
                          else: "SELESAI"
                        }
                      }
                    }
                  }
                }
              ],
              "challengeDimulai": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeDimulai.unit", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.challengeDimulai.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$lt":
                              [
                                "$timenow",
                                "$startTime"
                              ]
                          },
                          then: "AKAN DATANG",
                          else: "SELESAI"
                        }
                      }
                    }
                  }
                }
              ],
              "updateLeaderboard": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.unit", 0
                      ]
                  },
                  "aturWaktu":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.updateLeaderboard.aturWaktu", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.updateLeaderboard.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$switch":
                        {
                          branches:
                            [
                              {
                                case:
                                {
                                  "$lt":
                                    [
                                      "$timenow",
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add":
                                              [
                                                {
                                                  $dateFromString:
                                                  {
                                                    dateString: '$startTime'
                                                  },
                                                },
                                                {
                                                  "$multiply":
                                                    [
                                                      {
                                                        "$toInt":
                                                        {
                                                          "$first":
                                                          {
                                                            "$let":
                                                            {
                                                              vars:
                                                              {
                                                                datawaktu:
                                                                {
                                                                  "$let":
                                                                  {
                                                                    vars:
                                                                    {
                                                                      getdata:
                                                                      {
                                                                        "$arrayElemAt":
                                                                          [
                                                                            "$notifikasiPush.updateLeaderboard.aturWaktu", 0
                                                                          ]
                                                                      }
                                                                    },
                                                                    in: "$$getdata"
                                                                  }
                                                                },
                                                              },
                                                              in: "$$datawaktu"
                                                            }
                                                          },
                                                        },
                                                      },
                                                      3600000
                                                    ]
                                                }
                                              ]
                                          }
                                        }
                                      }
                                    ]
                                },
                                then: "AKAN DATANG"
                              },
                              {
                                case:
                                {
                                  "$lt":
                                    [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add":
                                              [
                                                {
                                                  $dateFromString:
                                                  {
                                                    dateString: '$endTime'
                                                  },
                                                },
                                                {
                                                  "$multiply":
                                                    [
                                                      {
                                                        "$toInt":
                                                        {
                                                          "$last":
                                                          {
                                                            "$let":
                                                            {
                                                              vars:
                                                              {
                                                                datawaktu:
                                                                {
                                                                  "$let":
                                                                  {
                                                                    vars:
                                                                    {
                                                                      getdata:
                                                                      {
                                                                        "$arrayElemAt":
                                                                          [
                                                                            "$notifikasiPush.updateLeaderboard.aturWaktu", 0
                                                                          ]
                                                                      }
                                                                    },
                                                                    in: "$$getdata"
                                                                  }
                                                                },
                                                              },
                                                              in: "$$datawaktu"
                                                            }
                                                          },
                                                        }
                                                      },
                                                      3600000
                                                    ]
                                                }
                                              ]
                                          }
                                        }
                                      },
                                      "$timenow"
                                    ]
                                },
                                then: "SELESAI"
                              },
                            ],
                          default: "SEDANG BERJALAN"
                        },
                      }
                    }
                  }
                }
              ],
              "challengeAkanBerakhir": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.unit", 0
                      ]
                  },
                  "aturWaktu":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeAkanBerakhir.aturWaktu", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.challengeAkanBerakhir.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$lt":
                              [
                                "$timenow",
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add":
                                        [
                                          {
                                            $dateFromString:
                                            {
                                              dateString: '$endTime'
                                            },
                                          },
                                          {
                                            "$multiply":
                                              [
                                                {
                                                  "$toInt":
                                                  {
                                                    "$arrayElemAt":
                                                      [
                                                        "$notifikasiPush.challengeAkanBerakhir.aturWaktu",
                                                        0
                                                      ]
                                                  }
                                                },
                                                3600000
                                              ]
                                          }
                                        ]
                                    }
                                  }
                                }
                              ]
                          },
                          then: "AKAN DATANG",
                          else: "SELESAI"
                        }
                      }
                    }
                  }
                }
              ],
              "challengeBerakhir": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.unit", 0
                      ]
                  },
                  "aturWaktu":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.challengeBerakhir.aturWaktu", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.challengeBerakhir.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$lt":
                              [
                                "$timenow",
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add":
                                        [
                                          {
                                            $dateFromString:
                                            {
                                              dateString: '$endTime'
                                            },
                                          },
                                          {
                                            "$multiply":
                                              [
                                                {
                                                  "$toInt":
                                                  {
                                                    "$arrayElemAt":
                                                      [
                                                        "$notifikasiPush.challengeBerakhir.aturWaktu",
                                                        0
                                                      ]
                                                  }
                                                },
                                                3600000
                                              ]
                                          }
                                        ]
                                    }
                                  }
                                }
                              ]
                          },
                          then: "AKAN DATANG",
                          else: "SELESAI"
                        }
                      }
                    }
                  }
                }
              ],
              "untukPemenang": [
                {
                  "include":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.include", 0
                      ]
                  },
                  "title":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.title", 0
                      ]
                  },
                  "titleEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.titleEN", 0
                      ]
                  },
                  "description":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.description", 0
                      ]
                  },
                  "descriptionEN":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.descriptionEN", 0
                      ]
                  },
                  "unit":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.unit", 0
                      ]
                  },
                  "aturWaktu":
                  {
                    "$arrayElemAt":
                      [
                        "$notifikasiPush.untukPemenang.aturWaktu", 0
                      ]
                  },
                  "statusNotifikasi":
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            {
                              "$arrayElemAt":
                                [
                                  "$notifikasiPush.untukPemenang.include",
                                  0
                                ]
                            },
                            "NO"
                          ]
                      },
                      then: "DISABLE",
                      else:
                      {
                        "$cond":
                        {
                          if:
                          {
                            "$lt":
                              [
                                "$timenow",
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add":
                                        [
                                          {
                                            $dateFromString:
                                            {
                                              dateString: '$endTime'
                                            },
                                          },
                                          {
                                            "$multiply":
                                              [
                                                {
                                                  "$toInt":
                                                  {
                                                    "$arrayElemAt":
                                                      [
                                                        "$notifikasiPush.untukPemenang.aturWaktu",
                                                        0
                                                      ]
                                                  },
                                                },
                                                3600000
                                              ]
                                          }
                                        ]
                                    }
                                  }
                                }
                              ]
                          },
                          then: "AKAN DATANG",
                          else: "SELESAI"
                        }
                      }
                    }
                  }
                }
              ],
            },
          ],
          totalsession:
          {
            "$last": "$session.session"
          },
          //listParticipant:1,
          // listParticipant:
          // {
          // 		"$reduce": 
          // 		{
          //         input: "$listParticipant",
          //         initialValue: "",
          //         in: 
          // 				{ 
          // 					$concat: 
          // 					[ 
          // 						"$$value",
          // 						{
          // 							"$toString":"$$this"
          // 						},
          // 						","
          // 					] 
          // 				}
          //     }
          // },
          session: 1
        }
      }
    ]);

    return query[0];
  }

  async findlistingBanner(targetbanner: string, jenischallenge: string, page: number): Promise<Challenge[]> {
    var pipeline = [];
    pipeline.push(
      {
        "$set": {
          "timenow": {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                "$add": [
                  new Date(),
                  25200000
                ]
              }
            }
          }
        }
      }
    );

    if (jenischallenge != undefined && jenischallenge != null) {
      var mongo = require('mongoose');
      var konvertchallenge = mongo.Types.ObjectId(jenischallenge);
      pipeline.push(
        {
          "$match":
          {
            "$and":
              [
                // {
                //   "$expr":
                //   {
                //     "$lte":
                //       [
                //         {
                //           "$concat":
                //           [
                //             "$startChallenge",
                //             " ",
                //             "$startTime"
                //           ]
                //         },
                //         "$timenow"
                //       ]
                //   }
                // },
                {
                  "$expr":
                  {
                    "$gte":
                      [
                        {
                          "$concat":
                            [
                              "$endChallenge",
                              " ",
                              "$endTime"
                            ]
                        },
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
                },
                {
                  "$expr":
                  {
                    "$eq":
                      [
                        "$jenisChallenge",
                        konvertchallenge
                      ]
                  }
                }
              ]
          }
        });
    }
    else {
      pipeline.push(
        {
          "$match":
          {
            "$and":
              [
                // {
                //   "$expr":
                //   {
                //     "$lte":
                //       [
                //         {
                //           "$concat":
                //           [
                //             "$startChallenge",
                //             " ",
                //             "$startTime"
                //           ]
                //         },
                //         "$timenow"
                //       ]
                //   }
                // },
                {
                  "$expr":
                  {
                    "$gte":
                      [
                        {
                          "$concat":
                            [
                              "$endChallenge",
                              " ",
                              "$endTime"
                            ]
                        },
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
    }

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

    pipeline.push(
      {
        "$project": projectdata
      },
      {
        "$sort":
        {
          createdAt: -1
        }
      },
      {
        "$limit": 5
      }
    );

    if (page > 0) {
      pipeline.push(
        {
          "$skip": page * 5
        }
      );
    }

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
        $unwind: "$InteraksiKonten"
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
            $ifNull: ['$InteraksiKonten.tagar', []]
          },
          "buatKonten":
          {
            $ifNull: ['$InteraksiKonten.buatKonten', []]
          },
          "suka": {
            $ifNull: ['$InteraksiKonten.suka', []]
          },
          "tonton": {
            $ifNull: ['$InteraksiKonten.tonton', []]
          },



        }
      });
    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async checkuserstatusjoin(iduser: string, jenischallenge: string, page: number, limit: number) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(iduser);
    var pipeline = [];
    pipeline.push({
      "$set": {
        timeEnd: {
          "$concat": [
            {
              "$dateToString": {
                "format": "%Y-%m-%d",
                "date": {
                  $toDate: "$endChallenge"
                }
              }
            },
            " ",
            "$endTime"
          ]
        }
      }
    },
      {
        "$set": {
          timeStart: {
            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": {
                    $toDate: "$startChallenge"
                  }
                }
              },
              " ",
              "$startTime"
            ]
          }
        }
      },
      {
        $set: {
          nowDate:
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), 25200000]
              }
            }
          }
        }
      });

    if (jenischallenge != undefined && jenischallenge != null) {
      var mongo = require('mongoose');
      var konvertjenischallenge = mongo.Types.ObjectId(jenischallenge);

      pipeline.push({
        $match: {
          $and: [
            {
              $expr:
              {
                $gte: ["$timeEnd", "$nowDate"]
              },
            },
            {
              "statusChallenge": "PUBLISH"
            },
            {
              "jenisChallenge": konvertjenischallenge
            }
          ]
        }
      });
    }
    else {
      pipeline.push(
        {
          $match: {
            $and: [
              {
                $expr:
                {
                  $gte: ["$timeEnd", "$nowDate"]
                },

              },
              {
                "statusChallenge": "PUBLISH"
              }
            ]
          }
        });
    }

    pipeline.push(
      {
        "$lookup":
        {
          from: "userChallenge",
          let:
          {
            userchallenge_fk: "$_id"
          },
          as: 'userChallenges',
          pipeline:
            [
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
                              "$$userchallenge_fk",
                              "$idChallenge"
                            ]
                        }
                      },
                      {
                        isActive: true
                      },
                      {
                        idUser: konvertid,

                      }
                    ]
                }
              },

            ]
        },

      },
      {
        $project: {
          "_id": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "startChallenge": 1,
          "endChallenge": 1,
          "startTime": 1,
          "endTime": 1,
          "jenisDurasi": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "statusChallenge": 1,
          searchBanner: {
            $arrayElemAt: ["$bannerSearch.image", 0]
          },
          bannerLeaderboard: {
            $arrayElemAt: ["$leaderBoard.bannerLeaderboard", 0]
          },
          statusJoined:
          {
            $cond: {
              if: {
                $gt: [{
                  $size: '$userChallenges'
                }, 0]
              },
              then: "Partisipan",
              else: "Bukan Partisipan"
            }
          },
          statusFormalChallenge:
          {
            $cond: {
              if: {
                $and: [
                  {
                    $gte: ["$timeEnd", "$nowDate"]
                  },
                  {
                    $lte: ["$timeStart", "$nowDate"]
                  },
                ]
              },
              then: "Berlangsung",
              else: "Akan Datang"
            }
          },
        }
      },
      {
        $sort: {
          statusChallenge: -1,
          timeStart: 1,
        }
      }
    );

    if (page > 0) {
      pipeline.push(
        {
          "$skip": page * limit
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

    var data = await this.ChallengeModel.aggregate(pipeline);

    return data;
  }

  async checkallchallenge(iduser: string, jenischallenge: string, page: number, limit: number) {
    var mongo = require('mongoose');
    var pipeline = [];
    pipeline.push({
      $set: {
        "timenow":
        {
          "$dateToString": {
            "format": "%Y-%m-%d %H:%M:%S",
            "date": {
              $add: [
                new Date(),
                25200000
              ]
            }
          }
        }
      }
    });

    var firstmatch = [];
    firstmatch.push(
      {
        $expr:
        {
          $lte:
            [
              "$timenow",
              {
                $concat: ["$endChallenge", " ", "$endTime"]
              }
            ]
        },

      },
      // {
      //   $expr:
      //   {
      //     $gte:
      //       [
      //         "$timenow",
      //         {
      //           $concat: ["$startChallenge", " ", "$startTime"]
      //         }
      //       ]
      //   },

      // },
      {
        "statusChallenge": "PUBLISH"
      }
    );
    if (jenischallenge != null && jenischallenge != undefined) {
      firstmatch.push(
        {
          "jenisChallenge": new mongo.Types.ObjectId(jenischallenge)
        }
      );
    }

    pipeline.push(
      {
        "$match":
        {
          "$and": firstmatch
        }
      }
    );

    pipeline.push(
      {
        $project: {
          _id: 1,
          peserta: 1,
          jenisChallenge: 1,
          nameChallenge: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          timeCeleng: 1,
          description: 1,
          durasi: 1,
          objectChallenge: 1,
          leaderBoard: 1,
          bannerSearch: 1,
          statusChallenge: 1,
          listParticipant: 1
        }
      },
      {
        "$lookup": {
          from: "userbasics",
          as: "joinUser",
          let: {
            localID: new mongo.Types.ObjectId(iduser)
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$localID"]
                    },

                  ]
                }
              }
            },

          ],

        }
      },
      {
        $unwind: {
          path: "$userCelengs",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$joinUser",

        }
      },
      {
        $set:
        {
          co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
        },

      },
      {
        $set:
        {
          ce:
            ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
        }
      },
      {
        $set:
        {
          all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
        }
      },
      {
        $set:
        {
          ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
        }
      },
      {
        $set:
        {
          coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
        }
      },
      {
        $set:
        {
          ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
        }
      },
      {
        $set:
        {
          other: ["Other"]
        }
      },
      {
        $set: {
          kelamin:
          {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$ce"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$co"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$other"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$ceCo"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$coOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$coOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$ceOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$all"
                },

              ],
              default: "kancut"
            }
          },

        }
      },
      {
        $set: {
          verified: {
            $cond: {
              if: {
                $eq: [{
                  $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                }, "ALL"]
              },
              then: true,
              else: {
                $cond: {
                  if: {
                    $eq: [{
                      $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                    }, "YES"]
                  },
                  else: {
                    $cond: {
                      if: {
                        $eq: [{
                          $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                        }, "NO"]
                      },
                      then: {
                        $cond: {
                          if: {
                            $eq: ["$joinUser.isIdVerified", false]
                          },
                          then: true,
                          else: false
                        }
                      },
                      else: false
                    }
                  },
                  then: {
                    $cond: {
                      if: {
                        $eq: ["$joinUser.isIdVerified", true]
                      },
                      then: true,
                      else: false
                    }
                  }
                }
              }
            },

          },

        }
      },
      {
        $set: {
          age:
          {
            $cond: {
              if: {
                $and: ['$joinUser.dob', {
                  $ne: ["$joinUser.dob", ""]
                }]
              },
              then: {
                $toInt: {
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: "$joinUser.dob"
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
        $set: {

          ageChallenge:
          {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: [0, 14]
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 28]
                      },
                      else: "error umur 28",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 43]
                      },
                      else: "error umur <43",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 100000]
                      },
                      else: "error umur >43",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 14]
                          }
                        ]
                      },
                      else: "error umur 14-1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 28]
                          }
                        ]
                      },
                      else: "error umur 28-1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 43]
                          }
                        ]
                      },
                      else: "error umur 43-1000",
                      then: true,

                    }
                  },

                },
                //beda case//
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 14]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 28]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,28,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 14]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 28]
                              },
                              {
                                $gt: ["$age", 14]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 28]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },

              ],
              "default": 10000
            }
          }
        }
      },
      {
        $set: {
          joined:
          {
            $cond: {
              if: {
                $eq: [{
                  $arrayElemAt: ["$peserta.caraGabung", 0]
                }, "SEMUA PENGGUNA"]
              },
              then:
              {
                $cond: {
                  if: {
                    $eq: ["$verified", true]
                  },
                  else: "NOT ALLOWED",
                  then:
                  {
                    $cond: {
                      if: {
                        $in: ["$joinUser.gender", "$kelamin"]
                      },
                      else: "NOT ALLOWED",
                      then:
                      {
                        $cond: {
                          if: {
                            $eq: ["$ageChallenge", true]
                          },
                          else: "NOT ALLOWED",
                          then:
                          {
                            $cond: {
                              if: {
                                $in: ["$joinUser.states.$id", {
                                  $arrayElemAt: ["$peserta.lokasiPengguna", 0]
                                }]
                              },
                              else: "NOT ALLOWED",
                              then: "ALLOWED"
                            }
                          },

                        }
                      }
                    }
                  },

                },

              },
              else:
              {
                $cond: {
                  if: {
                    $in: ["$joinUser._id", "$listParticipant"]
                  },
                  else: "NOT ALLOWED",
                  then: "ALLOWED"
                }
              },
            }
          },

        }
      },
      {
        $project: {
          _id: 1,
          bannerSearch: 1,
          jenisChallenge: 1,
          joined: 1,
          objectChallenge: 1,
          nameChallenge: 1,
          description: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          statusChallenge: 1,
          statusFormalChallenge:
          {
            $cond:
            {
              if:
              {
                $gte:
                  [
                    "$timenow",
                    {
                      $concat: ["$startChallenge", " ", "$startTime"]
                    }
                  ]
              },
              then: "Berlangsung",
              else: "Akan Datang"
            }
          },
          leaderBoard: 1
        }
      },
      {
        "$project":
        {
          _id: 1,
          peserta: 1,
          searchBanner:
          {
            "$arrayElemAt":
              [
                "$bannerSearch.image", 0
              ]
          },
          bannerLeaderboard:
          {
            "$arrayElemAt":
              [
                "$leaderBoard.bannerLeaderboard", 0
              ]
          },
          jenisChallenge: 1,
          statusJoined: "$joined",
          objectChallenge: 1,
          nameChallenge: 1,
          description: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          statusChallenge: 1,
          statusFormalChallenge: 1
        }
      },
      {
        $sort: {
          statusFormalChallenge: -1,
          startChallenge: 1,
          createdAt: 1
        }
      },
      {
        $skip: (page * limit)
      },
      {
        $limit: limit
      },
    );

    var query = await this.ChallengeModel.aggregate(pipeline);

    return query;
  }

  async checkallchallengev2(iduser: string, jenischallenge: string, page: number, limit: number) {
    var mongo = require('mongoose');
    var pipeline = [];
    pipeline.push({
      $set: {
        "timenow":
        {
          "$dateToString": {
            "format": "%Y-%m-%d %H:%M:%S",
            "date": {
              $add: [
                new Date(),
                25200000
              ]
            }
          }
        }
      }
    });

    var firstmatch = [];
    firstmatch.push(
      {
        $expr:
        {
          $lte:
            [
              "$timenow",
              {
                $concat: ["$endChallenge", " ", "$endTime"]
              }
            ]
        },

      },
      // {
      //   $expr:
      //   {
      //     $gte:
      //       [
      //         "$timenow",
      //         {
      //           $concat: ["$startChallenge", " ", "$startTime"]
      //         }
      //       ]
      //   },

      // },
      {
        "statusChallenge": "PUBLISH"
      }
    );
    if (jenischallenge != null && jenischallenge != undefined) {
      firstmatch.push(
        {
          "jenisChallenge": new mongo.Types.ObjectId(jenischallenge)
        }
      );
    }

    pipeline.push(
      {
        "$match":
        {
          "$and": firstmatch
        }
      }
    );

    pipeline.push(
      {
        $project: {
          _id: 1,
          peserta: 1,
          jenisChallenge: 1,
          nameChallenge: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          timeCeleng: 1,
          description: 1,
          durasi: 1,
          objectChallenge: 1,
          leaderBoard: 1,
          bannerSearch: 1,
          statusChallenge: 1,
          listParticipant: 1
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "joinUser",
          let: {
            localID: new mongo.Types.ObjectId(iduser)
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$localID"]
                    },

                  ]
                }
              }
            },

          ],

        }
      },
      {
        $unwind: {
          path: "$userCelengs",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$joinUser",

        }
      },
      {
        $set:
        {
          co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
        },

      },
      {
        $set:
        {
          ce:
            ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
        }
      },
      {
        $set:
        {
          all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
        }
      },
      {
        $set:
        {
          ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
        }
      },
      {
        $set:
        {
          coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
        }
      },
      {
        $set:
        {
          ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
        }
      },
      {
        $set:
        {
          other: ["Other"]
        }
      },
      {
        $set: {
          kelamin:
          {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$ce"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$co"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$other"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: "$ceCo"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$coOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$coOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$ceOther"
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.LAKI-LAKI", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.PEREMPUAN", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.jenisKelamin.OTHER", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: "$all"
                },

              ],
              default: "kancut"
            }
          },

        }
      },
      {
        $set: {
          verified: {
            $cond: {
              if: {
                $eq: [{
                  $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                }, "ALL"]
              },
              then: true,
              else: {
                $cond: {
                  if: {
                    $eq: [{
                      $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                    }, "YES"]
                  },
                  else: {
                    $cond: {
                      if: {
                        $eq: [{
                          $arrayElemAt: ["$peserta.tipeAkunTerverikasi", 0]
                        }, "NO"]
                      },
                      then: {
                        $cond: {
                          if: {
                            $eq: ["$joinUser.isIdVerified", false]
                          },
                          then: true,
                          else: false
                        }
                      },
                      else: false
                    }
                  },
                  then: {
                    $cond: {
                      if: {
                        $eq: ["$joinUser.isIdVerified", true]
                      },
                      then: true,
                      else: false
                    }
                  }
                }
              }
            },

          },

        }
      },
      {
        $set: {
          age:
          {
            $cond: {
              if: {
                $and: ['$joinUser.dob', {
                  $ne: ["$joinUser.dob", ""]
                }]
              },
              then: {
                $toInt: {
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: "$joinUser.dob"
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
        $set: {

          ageChallenge:
          {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: [0, 14]
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 28]
                      },
                      else: "error umur 28",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "NO"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 43]
                      },
                      else: "error umur <43",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $lte: ["$age", 100000]
                      },
                      else: "error umur >43",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 14]
                          }
                        ]
                      },
                      else: "error umur 14-1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 28]
                          }
                        ]
                      },
                      else: "error umur 28-1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$age", 100000]
                          },
                          {
                            $gt: ["$age", 43]
                          }
                        ]
                      },
                      else: "error umur 43-1000",
                      then: true,

                    }
                  },

                },
                //beda case//
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 14]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 28]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,28,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 14]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 28]
                              },
                              {
                                $gt: ["$age", 14]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.<14", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.14-28", 0]
                          }, 0]
                        }, "YES"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.29-43", 0]
                          }, 0]
                        }, "NO"]
                      },
                      {
                        $eq: [{
                          $arrayElemAt: [{
                            $arrayElemAt: ["$peserta.rentangUmur.44<", 0]
                          }, 0]
                        }, "YES"]
                      },

                    ]
                  },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $and: [
                              {
                                $lte: ["$age", 28]
                              },
                              {
                                $gt: ["$age", 0]
                              }
                            ]
                          },
                          {
                            $and: [
                              {
                                $lte: ["$age", 100000]
                              },
                              {
                                $gt: ["$age", 43]
                              }
                            ]
                          },

                        ]
                      },
                      else: "error umur 0,43,1000",
                      then: true,

                    }
                  },

                },

              ],
              "default": 10000
            }
          }
        }
      },
      {
        $set: {
          joined:
          {
            $cond: {
              if: {
                $eq: [{
                  $arrayElemAt: ["$peserta.caraGabung", 0]
                }, "SEMUA PENGGUNA"]
              },
              then:
              {
                $cond: {
                  if: {
                    $eq: ["$verified", true]
                  },
                  else: "NOT ALLOWED",
                  then:
                  {
                    $cond: {
                      if: {
                        $in: ["$joinUser.gender", "$kelamin"]
                      },
                      else: "NOT ALLOWED",
                      then:
                      {
                        $cond: {
                          if: {
                            $eq: ["$ageChallenge", true]
                          },
                          else: "NOT ALLOWED",
                          then:
                          {
                            $cond: {
                              if: {
                                $in: ["$joinUser.states.$id", {
                                  $arrayElemAt: ["$peserta.lokasiPengguna", 0]
                                }]
                              },
                              else: "NOT ALLOWED",
                              then: "ALLOWED"
                            }
                          },

                        }
                      }
                    }
                  },

                },

              },
              else:
              {
                $cond: {
                  if: {
                    $in: ["$joinUser._id", "$listParticipant"]
                  },
                  else: "NOT ALLOWED",
                  then: "ALLOWED"
                }
              },
            }
          },

        }
      },
      {
        $project: {
          _id: 1,
          bannerSearch: 1,
          jenisChallenge: 1,
          joined: 1,
          objectChallenge: 1,
          nameChallenge: 1,
          description: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          statusChallenge: 1,
          statusFormalChallenge:
          {
            $cond:
            {
              if:
              {
                $gte:
                  [
                    "$timenow",
                    {
                      $concat: ["$startChallenge", " ", "$startTime"]
                    }
                  ]
              },
              then: "Berlangsung",
              else: "Akan Datang"
            }
          },
          leaderBoard: 1
        }
      },
      {
        "$project":
        {
          _id: 1,
          peserta: 1,
          searchBanner:
          {
            "$arrayElemAt":
              [
                "$bannerSearch.image", 0
              ]
          },
          bannerLeaderboard:
          {
            "$arrayElemAt":
              [
                "$leaderBoard.bannerLeaderboard", 0
              ]
          },
          jenisChallenge: 1,
          statusJoined: "$joined",
          objectChallenge: 1,
          nameChallenge: 1,
          description: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime: 1,
          endTime: 1,
          createdAt: 1,
          timenow: 1,
          statusChallenge: 1,
          statusFormalChallenge: 1
        }
      },
      {
        $sort: {
          statusFormalChallenge: -1,
          startChallenge: 1,
          createdAt: 1
        }
      },
      {
        $skip: (page * limit)
      },
      {
        $limit: limit
      },
    );

    var query = await this.ChallengeModel.aggregate(pipeline);

    return query;
  }

  async userbadge() {
    var datachallengejuara = null;
    var status = null;
    var idsubchallenge = null;
    var idchallenge = null;
    var session = null;
    var startDatetime = null;
    var endDatetime = null;
    var userjuara = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    var datasubchalange = null;
    var idBadge = null;
    var idsub = null;
    try {
      datasubchalange = await this.subchallenge.findsub();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null) {

      for (let x = 0; x < datasubchalange.length; x++) {
        idsub = datasubchalange[x]._id.toString();
        try {
          datachallengejuara = await this.subchallenge.getjuara2(idsub);
        } catch (e) {
          datachallengejuara = null;
        }
        //console.log("datachallengejuara", datachallengejuara)

        if (datachallengejuara !== null && datachallengejuara.length > 0) {
          for (let i = 0; i < datachallengejuara.length; i++) {
            status = datachallengejuara[i].status;
            idsubchallenge = datachallengejuara[i]._id;
            idchallenge = datachallengejuara[i].challengeId;

            try {
              session = datachallengejuara[i].session;
            } catch (e) {
              session = 1;
            }
            startDatetime = datachallengejuara[i].startDatetime;
            endDatetime = datachallengejuara[i].endDatetime;
            userjuara = datachallengejuara[i].getlastrank;
            let lengtjuara = userjuara.length;
            let end = new Date(endDatetime);
            end.setHours(dt.getHours() + 12); // timestamp
            end = new Date(end);
            let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
            let strdateseminggu = getseminngu.toISOString();
            var repdatesm = strdateseminggu.replace('T', ' ');
            var splitdatesm = repdatesm.split('.');
            var timedatesm = splitdatesm[0];
            if (lengtjuara > 0) {
              for (let x = 0; x < lengtjuara; x++) {

                let iduser = userjuara[x].idUser;
                let ranking = userjuara[x].ranking;
                let score = userjuara[x].score;
                let lastRank = userjuara[x].lastRank;

                try {
                  idBadge = userjuara[x].idBadge;
                } catch (e) {
                  idBadge = null;
                }
                let idSubChallenges = userjuara[x].idSubChallenge;
                let databadge = null;
                try {
                  databadge = await this.userbadgeService.getUserbadge(iduser.toString(), idSubChallenges.toString());
                } catch (e) {
                  databadge = null;
                }

                if (databadge == null && databadge == undefined) {
                  if (status == "BERAKHIR") {

                    if (idBadge !== undefined && idBadge !== "") {
                      let Userbadge_ = new Userbadge();
                      Userbadge_.SubChallengeId = idSubChallenges;
                      Userbadge_.idBadge = idBadge;
                      Userbadge_.createdAt = timedate;
                      Userbadge_.isActive = true;
                      Userbadge_.userId = iduser;
                      Userbadge_.session = session;
                      Userbadge_.startDatetime = endDatetime;
                      Userbadge_.endDatetime = timedatesm;

                      await this.userbadgeService.create(Userbadge_);

                    }

                  }

                }

              }
            }

          }

        }
      }

    }


  }

  async updateUserbadge() {
    var idsubchallenge = null;
    var idchallenge = null;
    var session = null;
    var startDatetime = null;
    var endDatetime = null;
    var isActive = null;
    var status = null;
    var idUser = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    var datachallengejuara = null;
    var getlastrank = null;
    var databadge = null;
    var datasubchalange = null;
    var idSubChallenge2 = null;
    var idusbadge = null;
    var idsub = null;
    try {
      datasubchalange = await this.subchallenge.findsub();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null) {
      for (let x = 0; x < datasubchalange.length; x++) {
        idsub = datasubchalange[x]._id.toString();
        try {
          datachallengejuara = await this.subchallenge.getjuara2(idsub);
        } catch (e) {
          datachallengejuara = null;
        }
        if (datachallengejuara !== null && datachallengejuara.length > 0) {
          for (let i = 0; i < datachallengejuara.length; i++) {
            status = datachallengejuara[i].status;
            idsubchallenge = datachallengejuara[i]._id;
            idchallenge = datachallengejuara[i].challengeId;
            getlastrank = datachallengejuara[i].getlastrank;
            session = datachallengejuara[i].session;
            startDatetime = datachallengejuara[i].startDatetime;
            endDatetime = datachallengejuara[i].endDatetime;
            isActive = datachallengejuara[i].isActive;
            let end = new Date(endDatetime);
            end.setHours(dt.getHours() + 12); // timestamp
            end = new Date(end);
            let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
            let strdateseminggu = getseminngu.toISOString();
            var repdatesm = strdateseminggu.replace('T', ' ');
            var splitdatesm = repdatesm.split('.');
            var timedatesm = splitdatesm[0];
            if (dt >= getseminngu) {

              if (isActive == true) {
                let CreateSubChallengeDto_ = new CreateSubChallengeDto();
                CreateSubChallengeDto_.isActive = false;
                await this.subchallenge.update(idsubchallenge.toString(), CreateSubChallengeDto_);

              }

            }

          }
        }
      }

    }




  }

  async sendNotifeChallenge() {

    var datanotif = null;
    var email = null;
    var body = null;
    var bodyEN = null;
    var title = null;
    var titleEN = null;
    //var timenow = null;
    var datetime = null;
    var challengeID = null;
    var typeChallenge = null;
    var databasic = null;
    var id = null;
    var type = null;
    var languages = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var datapemenang = null;
    var getlastrank = null;
    var username = null;
    var ranking = null;
    var idUser = null;
    var databadge = null;
    var session = null;
    var subChallengeID = null;
    var titleAsli = null;
    var description = null;
    var all = null;
    var datanotifbyid = null;
    var idnotif = null;
    try {
      datanotif = await this.notifChallengeService.listnotifchallenge();
    } catch (e) {
      datanotif = null;
    }

    if (datanotif !== null && datanotif.length > 0) {

      for (let i = 0; i < datanotif.length; i++) {
        id = datanotif[i]._id;


        try {
          datanotifbyid = await this.notifChallengeService.listnotifchallengeByid(id.toString());
        } catch (e) {
          datanotifbyid = null;
        }
        if (datanotifbyid !== null && datanotifbyid.length > 0) {
          for (let j = 0; j < datanotifbyid.length; j++) {
            idnotif = datanotifbyid[j]._id;
            challengeID = datanotifbyid[j].challengeID;
            titleAsli = datanotifbyid[j].titleAsli;
            email = datanotifbyid[j].email;
            description = datanotifbyid[j].description;
            username = datanotifbyid[j].username;
            idUser = datanotifbyid[j].idUser;
            ranking = datanotifbyid[j].ranking;
            title = datanotifbyid[j].title;
            titleEN = datanotifbyid[j].titleEN;
            body = datanotifbyid[j].notification;
            bodyEN = datanotifbyid[j].notificationEN;
            datetime = datanotifbyid[j].datetime;
            type = datanotifbyid[j].type;
            subChallengeID = datanotifbyid[j].subChallengeID;
            typeChallenge = datanotifbyid[j].typeChallenge;
            session = datanotifbyid[j].session;

            all = datanotifbyid[0].all;

            if (all !== undefined && all == 1) {
              this.sendnotifmasalchallenge2(idnotif.toString(), 100);
              await this.notifChallengeService.updateStatussend(idnotif.toString());
            }
            else {
              try {
                databasic = await this.UserbasicnewService.findBymail(email);
              } catch (e) {
                databasic = null;
              }

              if (databasic !== null) {
                try {
                  languages = databasic.languages;
                  idlanguages = languages.oid.toString();
                  datalanguage = await this.languagesService.findOne(idlanguages)
                  langIso = datalanguage.langIso;

                  console.log(idlanguages)
                } catch (e) {
                  languages = null;
                  idlanguages = "";
                  datalanguage = null;
                  langIso = "";
                }

              }


              if (type == "untukPemenang") {

                let datasub = null;

                try {
                  datasub = await this.subchallenge.findOneByChallenge(subChallengeID.toString(), challengeID.toString(),);
                } catch (e) {
                  datasub = null;
                }

                if (datasub !== null) {
                  let endDatetime = null;
                  var dt = new Date(Date.now());
                  dt.setHours(dt.getHours() + 7); // timestamp
                  dt = new Date(dt);
                  try {
                    endDatetime = new Date(datasub.endDatetime);
                    endDatetime.setHours(endDatetime.getHours() + 7); // timestamp
                    endDatetime = new Date(endDatetime);
                  } catch (e) {
                    endDatetime = null;
                  }

                  if (dt > endDatetime) {
                    try {
                      // datapemenang = await this.subchallenge.getpemenang2(challengeID.toString(), subChallengeID.toString());
                      datapemenang = await this.UserchallengesService.getpemenang2(challengeID.toString(), subChallengeID.toString());
                    } catch (e) {
                      datapemenang = null;
                    }
                    if (datapemenang !== null && datapemenang.length > 0) {

                      try {
                        getlastrank = datapemenang;
                      } catch (e) {
                        getlastrank = null;
                      }
                      if (getlastrank !== null && getlastrank.length > 0) {
                        for (let x = 0; x < getlastrank.length; x++) {
                          let emailmenang = getlastrank[x].email
                          let idBadge = null;
                          let nameBadges = null;
                          let userid = getlastrank[x].idUser

                          try {
                            idBadge = getlastrank[x].idBadge;
                          } catch (e) {
                            idBadge = null;
                          }
                          let databadge = null;
                          try {
                            databadge = await this.userbadgeService.getUserbadge(userid.toString(), subChallengeID.toString());
                          } catch (e) {
                            databadge = null;
                          }

                          if (databadge == null) {


                            if (idBadge !== "") {

                              let dt = new Date(Date.now());
                              dt.setHours(dt.getHours() + 7); // timestamp
                              dt = new Date(dt);

                              let strdate = dt.toISOString();
                              let repdate = strdate.replace('T', ' ');
                              let splitdate = repdate.split('.');
                              let timedate = splitdate[0];

                              let end = new Date(endDatetime);
                              end.setHours(dt.getHours() + 12); // timestamp
                              end = new Date(end);
                              let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
                              let strdateseminggu = getseminngu.toISOString();
                              var repdatesm = strdateseminggu.replace('T', ' ');
                              var splitdatesm = repdatesm.split('.');
                              var timedatesm = splitdatesm[0];

                              let Userbadge_ = new Userbadge();
                              Userbadge_.SubChallengeId = subChallengeID;
                              Userbadge_.idBadge = idBadge;
                              Userbadge_.createdAt = timedate;
                              Userbadge_.isActive = true;
                              Userbadge_.userId = userid;
                              Userbadge_.session = session;
                              Userbadge_.startDatetime = datasub.endDatetime;
                              Userbadge_.endDatetime = timedatesm;

                              await this.userbadgeService.create(Userbadge_);

                            }

                          }

                          let rank = null;
                          try {
                            rank = getlastrank[x].ranking;
                          } catch (e) {
                            rank = 0;
                          }

                          if (idBadge !== null && idBadge !== "") {
                            try {
                              databadge = await this.BadgeService.findByid(idBadge.toString());
                            } catch (e) {
                              databadge = null;
                            }
                            if (databadge !== null && databadge !== undefined) {
                              nameBadges = databadge.name;

                            } else {
                              nameBadges = "NO BADGE"
                            }
                          } else {
                            nameBadges = "NO BADGE"
                          }


                          let ket2 = null;
                          let ket3 = null;
                          let ket2EN = null;
                          let ket3EN = null;
                          let title1 = null;
                          let title2 = null;
                          let titleEN1 = null;
                          let titleEN2 = null;
                          try {
                            ket2 = body.replace("$badge", nameBadges);
                          } catch (e) {
                            ket2 = body;
                          }
                          try {
                            ket3 = ket2.replace("$ranking", rank);
                          } catch (e) {
                            ket3 = ket2;
                          }
                          try {
                            ket2EN = bodyEN.replace("$badge", nameBadges);
                          } catch (e) {
                            ket2EN = bodyEN;
                          }
                          try {
                            ket3EN = ket2EN.replace("$ranking", rank);
                          } catch (e) {
                            ket3EN = ket2EN;
                          }
                          try {
                            title1 = title.replace("$ranking", rank);
                          } catch (e) {
                            title1 = title;
                          }
                          try {
                            title2 = title1.replace("$badge", nameBadges);
                          } catch (e) {
                            title2 = title1;
                          }
                          try {
                            titleEN1 = titleEN.replace("$ranking", rank);
                          } catch (e) {
                            titleEN1 = titleEN;
                          }
                          try {
                            titleEN2 = titleEN1.replace("$badge", nameBadges);
                          } catch (e) {
                            titleEN2 = titleEN1;
                          }
                          // let datanotifchall = null;
                          // try {

                          //   datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                          // } catch (e) {
                          //   datanotifchall = null;
                          // }

                          // if (datanotifchall !== null) {
                          //   console.log("==data sudah ada==")
                          // } else {
                          if (langIso == "en") {
                            if (email == emailmenang) {
                              await this.util.sendNotifChallenge("PEMENANG", emailmenang, titleEN2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);

                            }
                          } else {
                            if (email == emailmenang) {

                              await this.util.sendNotifChallenge("PEMENANG", emailmenang, title2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);

                            }
                          }

                          // }


                        }

                      }

                    }
                  }
                }


              }
              else if (type == "updateLeaderboard") {

                var datauserchall = null;
                let rank = null;
                let rankup = null;
                let ket2 = null;
                let ket3 = null;
                let ket2EN = null;
                let ket3EN = null;
                let title1 = null;
                let title2 = null;
                let titleEN1 = null;
                let titleEN2 = null;
                let datachallenges = null;
                let badge = null;
                let nameBadges = null;
                try {
                  datauserchall = await this.UserchallengesService.findByChallengeandUser3(challengeID.toString(), idUser.toString(), subChallengeID.toString());
                } catch (e) {
                  datauserchall = null;
                }

                try {
                  datachallenges = await this.findOne(challengeID.toString());
                } catch (e) {
                  datachallenges = null;
                }

                if (datachallenges !== null) {

                  try {
                    badge = datachallenges.ketentuanHadiah[0].badge[0].juara1;
                  } catch (e) {
                    badge = null;
                  }

                  if (badge !== null && badge !== "") {
                    try {
                      databadge = await this.BadgeService.findByid(badge.toString());
                    } catch (e) {
                      databadge = null;
                    }
                    if (databadge !== null && databadge !== undefined) {
                      nameBadges = databadge.name;

                    } else {
                      nameBadges = "NO BADGE"
                    }
                  } else {
                    nameBadges = "NO BADGE"
                  }

                }

                if (datauserchall !== null && datauserchall !== undefined) {
                  try {
                    rank = datauserchall.ranking;
                  } catch (e) {
                    rank = 0;
                  }

                }
                if (rank !== 0 && rank > 1) {
                  rankup = rank - 1;
                } else {
                  rankup = 0;
                }

                if (rank == 1) {
                  try {
                    ket2 = body.replace("$ranking", rank);
                  } catch (e) {
                    ket2 = body;
                  }
                  try {
                    ket3 = ket2.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3 = ket2;
                  }

                  try {
                    ket2EN = bodyEN.replace("$ranking", rank);
                  } catch (e) {
                    ket2EN = bodyEN;
                  }
                  try {
                    ket3EN = ket2EN.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3EN = ket2EN;
                  }
                } else {
                  try {
                    ket2 = body.replace("$ranking", rankup);
                  } catch (e) {
                    ket2 = body;
                  }
                  try {
                    ket3 = ket2.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3 = ket2;
                  }

                  try {
                    ket2EN = bodyEN.replace("$ranking", rankup);
                  } catch (e) {
                    ket2EN = bodyEN;
                  }
                  try {
                    ket3EN = ket2EN.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3EN = ket2EN;
                  }
                }

                try {
                  title1 = title.replace("$ranking", rank);
                } catch (e) {
                  title1 = title;
                }
                try {
                  title2 = title1.replace("$badge", nameBadges);
                } catch (e) {
                  title2 = title1;
                }
                try {
                  titleEN1 = titleEN.replace("$ranking", rank);
                } catch (e) {
                  titleEN1 = titleEN;
                }
                try {
                  titleEN2 = titleEN1.replace("$badge", nameBadges);
                } catch (e) {
                  titleEN2 = titleEN1;
                }
                if (rank > 1) {

                  let datanotifchall = null;
                  try {

                    datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                  } catch (e) {
                    datanotifchall = null;
                  }

                  if (datanotifchall !== null) {
                    console.log("==data sudah ada==")
                  } else {
                    if (langIso == "en") {
                      await this.util.sendNotifChallenge("", email, titleEN2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);

                    } else {
                      await this.util.sendNotifChallenge("", email, title2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);
                    }

                  }
                }


              }
              else if (type == "challengeBerakhir") {
                // let datanotifchall = null;
                // try {

                //   datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                // } catch (e) {
                //   datanotifchall = null;
                // }

                // if (datanotifchall !== null) {
                //   console.log("==data sudah ada==")
                // } else {
                if (langIso == "en") {
                  await this.util.sendNotifChallenge("BERAKHIR", email, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);

                } else {
                  await this.util.sendNotifChallenge("BERAKHIR", email, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);
                }

                //}
              }
              else {
                // let datanotifchall = null;
                // try {

                //   datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                // } catch (e) {
                //   datanotifchall = null;
                // }

                // if (datanotifchall !== null) {
                //   console.log("==data sudah ada==")
                // } else {
                if (langIso == "en") {
                  await this.util.sendNotifChallenge("", email, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);

                } else {
                  await this.util.sendNotifChallenge("", email, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);

                }

                //  }

              }
              await this.notifChallengeService.updateStatussend(idnotif.toString());
            }
          }


        }


      }

    }

  }

  async sendnotifmasalchallenge(challengeid: string, subchallenge: string, limit: number) {
    var mongo = require('mongoose');
    var totalall = null;

    var gettotaluser = await this.userbasicsSS.gettotalyopmail(null, null);
    // var gettotaluser = await this.userbasicsSS.getcount();
    try {
      totalall = gettotaluser.length / limit;
      // totalall = gettotaluser[0].totalpost / limit; //nanti dibalikin lagi
    } catch (e) {
      gettotaluser = null;
      totalall = 0;
    }
    var totalpage = 0;
    var tpage2 = (totalall).toFixed(0);
    var tpage = (totalall % limit);
    if (tpage > 0 && tpage < 5) {
      totalpage = parseInt(tpage2) + 1;

    } else {
      totalpage = parseInt(tpage2);
    }
    console.log(totalpage);

    console.log(totalall);

    var title = null;
    var body = null;
    var bodyEN = null;
    var typeChallenge = null;
    var datetime = null;

    var getdata = null;

    var listnotif = await this.notifChallengeService.findbyChallengeandSub(challengeid, subchallenge);
    if (listnotif.length != 0) {
      getdata = listnotif[0];
      // if (listnotif.length == 1) {
      //   getdata = listnotif[0];
      // }
      // else {
      //   var getdataakandatang = new Date(listnotif[0].datetime);
      //   var getdatadimulai = new Date(listnotif[1].datetime);
      //   var timenow = new Date(await this.util.getDateTimeString());

      //   var selisihdatang = Math.abs(getdataakandatang.getTime() - timenow.getTime());
      //   var selisihdimulai = Math.abs(getdatadimulai.getTime() - timenow.getTime());

      //   if (selisihdatang < selisihdimulai) {
      //     getdata = listnotif[0];
      //   }
      //   else {
      //     getdata = listnotif[1];
      //   }
      // }

      var updatedata = new notifChallenge();
      updatedata.isSend = true;
      await this.notifChallengeService.update(getdata._id.toString(), updatedata);

      datetime = getdata.datetime;

      // console.log(getdata);

      var array = [];
      for (let i = 0; i < totalpage; i++) {
        var data = await this.userbasicsSS.gettotalyopmail(i, limit);
        // var data = await this.userbasicsSS.getpanggilanuser(i, limit);
        // console.log('page ke - ' + i);
        // console.log(data);
        // var dum = 'page ke - ' + i;
        // array.push(dum);
        if (data.length != 0) {
          for (var loopuser = 0; loopuser < data.length; loopuser++) {
            if (data[loopuser].akunmati == false && (data[loopuser].username != null && data[loopuser].username != null)) {
              // var insertobj = {};
              // insertobj['email'] = data[loopuser].email;
              // insertobj['username'] = data[loopuser].username;

              var setconverttitle = null;
              var setconverttitleEN = null;
              var setconvertdesc = null;
              var setconvertdescEN = null;
              var getittle = getdata.userID[0].title;
              try {
                var cariusername = getittle.replaceAll("$username", data[loopuser].username);
                setconverttitle = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconverttitle = getdata.userID[0].title;
              }
              var gettitleEN = getdata.userID[0].titleEN;
              try {
                var cariusername = gettitleEN.replaceAll("$username", data[loopuser].username);
                setconverttitleEN = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconverttitleEN = gettitleEN;
              }
              var getdesc = getdata.userID[0].notification;
              try {
                var cariusername = getdesc.replaceAll("$username", data[loopuser].username);
                setconvertdesc = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconvertdesc = getdesc;
              }
              var getdescEN = getdata.userID[0].notificationEN;
              try {
                var cariusername = getdescEN.replaceAll("$username", data[loopuser].username);
                setconvertdescEN = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconvertdescEN = getdescEN;
              }

              var result = null;
              if (data[loopuser].languages == "en") {
                result = setconverttitleEN;
              }
              else {
                result = setconverttitle;
              }

              var checkdata = await this.NotificationsService.findNotifchallenge(data[loopuser].email, "CHALLENGE", getdata.challengeID, datetime);
              if (checkdata == null) {
                await this.util.sendNotifChallenge("", data[loopuser].email, result, setconvertdesc, setconvertdescEN, "CHALLENGE", "ACCEPT", getdata.challengeID, getdata.type, "", datetime);
              }

              // array.push(insertobj);
            }
          }
        }
      }

      // return array;
    }
  }

  async updateBadgeex() {


    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];

    var datasubchalange = null;

    var idusbadge = null;

    try {
      datasubchalange = await this.userbadgeService.getUserbadgeExpired();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null && datasubchalange.length > 0) {
      for (let x = 0; x < datasubchalange.length; x++) {
        try {
          idusbadge = datasubchalange[x]._id.toString();
        } catch (e) {
          idusbadge = null;
        }

        if (idusbadge !== null && idusbadge !== undefined) {
          try {
            await this.userbadgeService.updateNonactive(idusbadge.toString());
            console.log(" berhasil update " + idusbadge.toString());
          } catch (e) {
            console.log(" gagal update " + idusbadge.toString());
          }
        }
      }

    }


  }

  async updateSubchallengeex() {


    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];

    var datasubchalange = null;

    var idusbadge = null;

    try {
      datasubchalange = await this.subchallenge.getSubchallengeExpired();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null && datasubchalange.length > 0) {
      for (let x = 0; x < datasubchalange.length; x++) {
        try {
          idusbadge = datasubchalange[x]._id.toString();
        } catch (e) {
          idusbadge = null;
        }

        if (idusbadge !== null && idusbadge !== undefined) {
          try {
            await this.subchallenge.updateNonactive(idusbadge.toString());
            console.log(" berhasil update " + idusbadge.toString());
          } catch (e) {
            console.log(" gagal update " + idusbadge.toString());
          }
        }
      }

    }


  }

  async sendnotifmasalchallenge2(id: string, limit: number) {
    var mongo = require('mongoose');
    var totalall = null;

    var gettotaluser = await this.UserbasicnewService.gettotalyopmail(null, null);
    // var gettotaluser = await this.userbasicsSS.getcount();
    try {
      totalall = gettotaluser.length / limit;
      // totalall = gettotaluser[0].totalpost / limit; //nanti dibalikin lagi
    } catch (e) {
      gettotaluser = null;
      totalall = 0;
    }
    var totalpage = 0;
    var tpage2 = (totalall).toFixed(0);
    var tpage = (totalall % limit);
    if (tpage > 0 && tpage < 5) {
      totalpage = parseInt(tpage2) + 1;

    } else {
      totalpage = parseInt(tpage2);
    }
    console.log(totalpage);

    console.log(totalall);

    var title = null;
    var body = null;
    var bodyEN = null;
    var typeChallenge = null;
    var datetime = null;

    var getdata = null;

    var listnotif = await this.notifChallengeService.findOne(id);
    if (listnotif !== null) {
      getdata = listnotif;

      // var updatedata = new notifChallenge();
      // updatedata.isSend = true;
      // await this.notifChallengeService.update(getdata._id.toString(), updatedata);

      datetime = getdata.datetime;

      // // console.log(getdata);

      var array = [];
      for (let i = 0; i < totalpage; i++) {
        var data = await this.UserbasicnewService.gettotalyopmail(i, limit);
        // var data = await this.userbasicsSS.getpanggilanuser(i, limit);
        // console.log('page ke - ' + i);
        // console.log(data);
        // var dum = 'page ke - ' + i;
        // array.push(dum);
        if (data.length != 0) {
          for (var loopuser = 0; loopuser < data.length; loopuser++) {
            if (data[loopuser].akunmati == false && (data[loopuser].username != null && data[loopuser].username != null)) {
              // var insertobj = {};
              // insertobj['email'] = data[loopuser].email;
              // insertobj['username'] = data[loopuser].username;

              var setconverttitle = null;
              var setconverttitleEN = null;
              var setconvertdesc = null;
              var setconvertdescEN = null;
              var getittle = getdata.userID[0].title;
              try {
                var cariusername = getittle.replaceAll("$username", data[loopuser].username);
                setconverttitle = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconverttitle = getdata.userID[0].title;
              }
              var gettitleEN = getdata.userID[0].titleEN;
              try {
                var cariusername = gettitleEN.replaceAll("$username", data[loopuser].username);
                setconverttitleEN = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconverttitleEN = gettitleEN;
              }
              var getdesc = getdata.userID[0].notification;
              try {
                var cariusername = getdesc.replaceAll("$username", data[loopuser].username);
                setconvertdesc = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconvertdesc = getdesc;
              }
              var getdescEN = getdata.userID[0].notificationEN;
              try {
                var cariusername = getdescEN.replaceAll("$username", data[loopuser].username);
                setconvertdescEN = cariusername.replaceAll("$title", getdata.nameChallenge);
              }
              catch (e) {
                setconvertdescEN = getdescEN;
              }

              var result = null;
              if (data[loopuser].languages == "en") {
                result = setconverttitleEN;
              }
              else {
                result = setconverttitle;
              }

              var checkdata = await this.NotificationsService.findNotifchallenge(data[loopuser].email, "CHALLENGE", getdata.challengeID, datetime);
              if (checkdata == null) {
                await this.util.sendNotifChallenge("", data[loopuser].email, result, setconvertdesc, setconvertdescEN, "CHALLENGE", "ACCEPT", getdata.challengeID, getdata.type, "", datetime);
              }

              // array.push(insertobj);
            }
          }
        }
      }

      // return array;
    }
  }
  async challengeKontenNew() {
    var pipeline = [];

    pipeline.push( {
      $set: {
          "timenow": 
          {
              "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                      $add: [
                          new Date(),
                          25200000
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
                  $expr: 
                  {
                      $gte: 
                      [
                          "$timenow",
                          "$startChallenge",
                          
                      ]
                  },
                  
              },
              {
                  $expr: 
                  {
                      $lte: 
                      [
                          "$timenow",
                          "$endChallenge",
                          
                      ]
                  },
                  
              },
              
          ]
      }
  },
   {
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
        "idChallenge":"$_id",
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
      $unwind: "$InteraksiKonten"
    },
    {
      $project: {
        "idChallenge":1,
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
          $ifNull: ['$InteraksiKonten.tagar', ""]
        },
        "buatKonten":
        {
          $ifNull: ['$InteraksiKonten.buatKonten', []]
        },
        "suka": {
          $ifNull: ['$InteraksiKonten.suka', []]
        },
        "tonton": {
          $ifNull: ['$InteraksiKonten.tonton', []]
        },



      }
    });
    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }
}
