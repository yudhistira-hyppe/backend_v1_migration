import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userchallenges, UserchallengesDocument } from './schemas/userchallenges.schema';

@Injectable()
export class UserchallengesService {

    constructor(
        @InjectModel(Userchallenges.name, 'SERVER_FULL')
        private readonly UserchallengesModel: Model<UserchallengesDocument>,
    ) { }

    async create(Userchallenges_: Userchallenges): Promise<Userchallenges> {
        const _Userchallenges_ = this.UserchallengesModel.create(Userchallenges_);
        return _Userchallenges_;
    }

    async findData(userchallenges: Userchallenges): Promise<Userchallenges[]> {
        return this.UserchallengesModel.find(userchallenges).exec();
    }

    async updateByUSer(id: string, idSubChallenge: string, userchallenges: Userchallenges) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }, userchallenges).exec();
        return result;
    }

    async findOne(id: string): Promise<Userchallenges> {
        return this.UserchallengesModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findOneByid(id: string, idSubChallenge: string): Promise<Userchallenges> {
        return this.UserchallengesModel.findOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }).exec();
    }

    async findByChallengeandUser(challenge: string, user: string) {
        var mongo = require('mongoose');
        var data = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                "idChallenge": new mongo.Types.ObjectId(challenge),
                            },
                            {
                                "idUser": new mongo.Types.ObjectId(user),
                            },
                            {
                                "isActive": true
                            }
                        ]
                }
            }
        ]);

        return data;
    }

    async findByChallengeandUser2(challenge: string, user: string, idSubChallenge: string) {

        var data = await this.UserchallengesModel.aggregate([
            {
                $match: {
                    "idChallenge": new Types.ObjectId(challenge),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),
                    "idUser": new Types.ObjectId(user),
                }
            }
        ]);

        return data[0];
    }

    async findByChallengeandUser3(challenge: string, user: string, idSubChallenge: string) {

        var data = await this.UserchallengesModel.aggregate([
            // {
            //     $match: {
            //         "idChallenge": new Types.ObjectId(challenge),
            //         "idSubChallenge": new Types.ObjectId(idSubChallenge),
            //         "idUser": new Types.ObjectId(user),
            //     }
            // }
            {
                $match: {
                    idSubChallenge: new Types.ObjectId(idSubChallenge),
                }
            },
            {
                $setWindowFields: {
                    //partitionBy: "$state",
                    sortBy: {
                        score: - 1
                    },
                    output: {
                        rankNew: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            {
                $match: {
                    idUser: new Types.ObjectId(user),
                }
            },
            {
                $project: {
                    ranking: "$rankNew"
                }
            }
        ]);

        return data[0];
    }

    async find(): Promise<Userchallenges[]> {
        return this.UserchallengesModel.find().exec();
    }

    async update(id: string, Userchallenges_: Userchallenges): Promise<Userchallenges> {
        let data = await this.UserchallengesModel.findByIdAndUpdate(id, Userchallenges_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }
    async updateActionChallenge(id: string, data: {}) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id) }, { $push: { activity: data } }).exec();
        return result;
    }
    async updateUserchallenge(id: string, idSubChallenge: string, score: number) {
        this.UserchallengesModel.updateOne(
            {

                _id: new Types.ObjectId(id), idSubChallenge: idSubChallenge
            },
            { $inc: { score: score } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateUnUserchallenge(id: string, idSubChallenge: string, score: number) {
        this.UserchallengesModel.updateOne(
            {

                _id: new Types.ObjectId(id), idSubChallenge: idSubChallenge
            },
            { $inc: { score: -score } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async delete(userchallenge: any[], user: string, data: Userchallenges) {
        var mongo = require('mongoose');
        return await this.UserchallengesModel.updateMany(
            {
                "_id":
                {
                    "$in": userchallenge
                },
                "idUser": mongo.Types.ObjectId(user),
            },
            {
                "$set": data
            }
        );
    }

    async userChallengebyIdChall(iduser: string, idchallenge: string) {
        var query = await this.UserchallengesModel.aggregate([


            {
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
                $match: {
                    "idChallenge": new Types.ObjectId(idchallenge),
                    "idUser": new Types.ObjectId(iduser),
                    "isActive": true
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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },

                        ]
                }
            },

            {
                $lookup: {
                    from: 'subChallenge',
                    localField: 'idSubChallenge',
                    foreignField: '_id',
                    as: 'subChallenge_data',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "ranking": 1,
                    "score": 1,
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },
                    "timenow": 1,

                }
            },


        ]);
        return query;
    }


    async userChallengebyUser(iduser: string,idChallenge:string) {
        var query = await this.UserchallengesModel.aggregate([


            {
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
                $match: {
                //    "idChallenge": new Types.ObjectId(idChallenge),
                //    "idSubChallenge":new Types.ObjectId(idSubChallenge),
                   "idUser": new Types.ObjectId(iduser),
                   "isActive": true
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
                                    "$startDatetime",
                                    
                                ]
                            },
                            
                        },
                        {
                            $expr: 
                            {
                                $lte: 
                                [
                                    "$timenow",
                                    "$endDatetime",
                                    
                                ]
                            },
                            
                        },
                        
                    ]
                }
            },
            {
                $lookup: {
                    from: 'challenge',
                    localField: 'idChallenge',
                    foreignField: '_id',
                    as: 'challenge_data',
                    
                },
                
            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "ranking": 1,
                    "score": 1,
                    "maxScore": 1,
                    "maxDate": 1,
                    "isBot": 1,
                    "challenge_data": 1,
                    "timenow": 1,
                    
                }
            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "maxScore": 1,
                    "maxDate": 1,
                    "isBot": 1,
                    "metrik": {
                        $arrayElemAt: ["$challenge_data.metrik", 0]
                    },
                    
                }
            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "maxScore": 1,
                    "maxDate": 1,
                    "isBot": 1,
                    "InteraksiKonten": {
                        $arrayElemAt: ["$metrik.InteraksiKonten", 0]
                    },
                     "AktivitasAkun": {
                        $arrayElemAt: ["$metrik.AktivitasAkun", 0]
                    },
                }
            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "maxScore": 1,
                    "maxDate": 1,
                    "isBot": 1,
                    "suka": {
                        $arrayElemAt: ["$InteraksiKonten.suka", 0]
                    },
                                "tonton": {
                        $arrayElemAt: ["$InteraksiKonten.tonton", 0]
                    },
                    "buatKonten": {
                        $arrayElemAt: ["$InteraksiKonten.buatKonten", 0]
                    },
                                 "tagar": {
                        $arrayElemAt: ["$InteraksiKonten.tagar", 0]
                    },
                                 "Referal": {
                        $arrayElemAt: ["$AktivitasAkun.Referal", 0]
                    },
                                 "Ikuti": {
                        $arrayElemAt: ["$AktivitasAkun.Ikuti", 0]
                    },
                }
            },
        ]);
        return query;
    }

    
    async datauserchall() {
        var query = await this.UserchallengesModel.aggregate([

            {
                $match: {
                    "isActive": true
                }
            },
            {

                $sort: { score: -1, createdAt: -1 }
            }
        ]);
        return query;
    }

    async datauserchallbyidchall(idchall: string, idSubChallenge: string) {
        var query = await this.UserchallengesModel.aggregate([

            {
                $match: {
                    "isActive": true,
                    "idChallenge": new Types.ObjectId(idchall),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),

                }
            },

            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "ranking": 1,
                    "score": 1,
                    "rejectRemark": 1,

                }
            },

        ]);
        return query;
    }

    async updateScoreNull(id: string, updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "score": 0, "updatedAt": updatedAt, } });
        return data;
    }


    async updateRangking(id: string, rangking: number, updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "ranking": rangking, "updatedAt": updatedAt, } });
        return data;
    }

    async updateActivity(id: string, activity: any[], updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "activity": activity, "updatedAt": updatedAt, } });
        return data;
    }

    async updateScoring(id: string, idSubChallenge: string, score: number) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id), "idSubChallenge": new Types.ObjectId(idSubChallenge) },
            { $set: { "score": score, } });
        return data;
    }
    async updateHistory(id: string, idSubChallenge: string, data: {}) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }, { $push: { history: data } }).exec();
        return result;
    }

    async listUserChallenge(idChallenge: string) {
        var pipeline = [];
        pipeline.push({
            $match: {
                "idChallenge": new Types.ObjectId(idChallenge),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'idUser',
                    foreignField: '_id',
                    as: 'databasic',

                },

            },
            {
                $lookup: {
                    from: 'subChallenge',
                    localField: 'idSubChallenge',
                    foreignField: '_id',
                    as: 'subChallenge_data',

                },

            },
            {
                $lookup: {
                    from: 'challenge',
                    localField: 'idChallenge',
                    foreignField: '_id',
                    as: 'Challenge_data',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idUser": 1,
                    "email": {
                        $arrayElemAt: ["$databasic.email", 0]
                    },
                    "idSubChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "activity": 1,
                    "history": 1,
                    "ranking":
                    {
                        "$ifNull":
                            [
                                "$ranking",
                                0
                            ]
                    },
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },
                    "nameChallenge": {
                        $arrayElemAt: ["$Challenge_data.nameChallenge", 0]
                    },
                    "notifikasiPush": {
                        $arrayElemAt: ["$Challenge_data.notifikasiPush", 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'userauths',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'dataauth',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idUser": 1,
                    "email": 1,
                    "idSubChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "activity": 1,
                    "history": 1,
                    "session": 1,
                    "ranking": 1,
                    "nameChallenge": 1,
                    "notifikasiPush": 1,
                    "username": {
                        $arrayElemAt: ["$dataauth.username", 0]
                    },

                }
            },
            {
                "$group":
                {
                    _id: {
                        idChallenge: "$idChallenge",
                        idSubChallenge: "$idSubChallenge",
                        startDatetime: "$startDatetime",
                        endDatetime: "$endDatetime",
                        session: "$session",
                        nameChallenge: "$nameChallenge",
                        notifikasiPush: "$notifikasiPush",

                    },
                    userID:
                    {
                        "$push":
                        {
                            "idUser": "$idUser",
                            "email": "$email",
                            "username": "$username",
                            "ranking": "$ranking"
                        }
                    }
                }
            },
            {
                "$project":
                {
                    _id: 0,
                    idChallenge: "$_id.idChallenge",
                    idSubChallenge: "$_id.idSubChallenge",
                    startDatetime: "$_id.startDatetime",
                    endDatetime: "$_id.endDatetime",
                    session: "$_id.session",
                    nameChallenge: "$_id.nameChallenge",
                    notifikasiPush: "$_id.notifikasiPush",
                    userID: 1
                }
            },

        );
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }

    async checkUserjoinchallenge(challenge: string, userid: string) {
        var mongo = require('mongoose');
        var konvertchallenge = mongo.Types.ObjectId(challenge);
        var konvertid = mongo.Types.ObjectId(userid);

        var query = await this.UserchallengesModel.aggregate([
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
                                            "$idChallenge", konvertchallenge
                                        ]
                                }
                            },
                            {
                                "$expr":
                                {
                                    "$eq":
                                        [
                                            "$idUser", konvertid
                                        ]
                                }
                            }
                        ]
                }
            },
            {
                "$limit": 1
            },
        ]);

        return query;
    }

    async checkuserstatusjoin(target: string) {
        var mongo = require('mongoose');
        var konvertid = new mongo.Types.ObjectId(target);
        var result = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "idUser": konvertid
                }
            },
            {
                "$set":
                {
                    "datenow":
                    {
                        "$dateToString":
                        {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date":
                            {
                                $add: [new Date(), + 25200000]
                            }
                        }
                    }
                }
            },
            {
                "$lookup":
                {
                    from: "challenge",
                    as: "challengedata",
                    let:
                    {
                        "fk_challenge": "$idChallenge",
                        "now": "$datenow"
                    },
                    pipeline:
                        [
                            {
                                "$addFields":
                                {
                                    "setend":
                                    {
                                        "$concat":
                                            [
                                                "$endChallenge",
                                                " ",
                                                "$startTime"
                                            ]
                                    },
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
                                                    "$eq":
                                                        [
                                                            "$_id", "$$fk_challenge"
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$statusChallenge", "PUBLISH"
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$gt":
                                                        [
                                                            "$setend", "$$now"
                                                        ]
                                                }
                                            }
                                        ]
                                }
                            }
                        ]
                }
            },
            {
                "$unwind":
                {
                    path: "$challengedata"
                }
            },
            {
                "$group":
                {
                    _id: null,
                    total:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$project":
                {
                    _id: 0,
                    join_status:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$total", 0
                                    ]
                            },
                            then: false,
                            else: true
                        }
                    }
                }
            }
        ]);

        return result[0];
    }

    async wilayahpengguna(id: string) {
        var mongo = require('mongoose');
        var data = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                idChallenge: new mongo.Types.ObjectId(id)
                            },
                            {
                                isActive: true
                            }
                        ]
                }
            },
            {
                "$group":
                {
                    _id: "$idUser"
                }
            },
            {
                "$lookup":
                {
                    from: 'userbasics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'basic_data'
                },
            },
            {
                "$project":
                {
                    state:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$basic_data.states.$id", 0
                                        ]
                                },
                                null
                            ]
                    }
                }
            },
            {
                "$lookup":
                {
                    from: 'areas',
                    localField: 'state',
                    foreignField: '_id',
                    as: 'wilayah'
                },
            },
            {
                "$project":
                {
                    stateName:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$wilayah.stateName", 0
                                        ]
                                },
                                "Lainnya"
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$stateName",
                    total:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$group":
                {
                    _id: null,
                    totaldata:
                    {
                        "$sum": "$total"
                    },
                    data:
                    {
                        "$push":
                        {
                            _id: "$_id",
                            total: "$total"
                        }
                    }
                }
            },
            {
                "$unwind":
                {
                    path: "$data"
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
                    _id: "$data._id",
                    //total:{}"$data.total",
                    persentase:
                    {
                        "$multiply":
                            [
                                {
                                    "$divide":
                                        [
                                            "$data.total", "$totaldata"
                                        ]
                                }, 100
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$_id",
                    persentase:
                    {
                        "$first": "$persentase"
                    }
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            }
        ]);

        return data
    }

    async wilayahpenggunav2(id: string) {
        var mongo = require('mongoose');
        var data = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                idChallenge: new mongo.Types.ObjectId(id)
                            },
                            {
                                isActive: true
                            }
                        ]
                }
            },
            {
                "$group":
                {
                    _id: "$idUser"
                }
            },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'basic_data'
                },
            },
            {
                "$project":
                {
                    state:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$basic_data.states.$id", 0
                                        ]
                                },
                                null
                            ]
                    }
                }
            },
            {
                "$lookup":
                {
                    from: 'areas',
                    localField: 'state',
                    foreignField: '_id',
                    as: 'wilayah'
                },
            },
            {
                "$project":
                {
                    stateName:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$wilayah.stateName", 0
                                        ]
                                },
                                "Lainnya"
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$stateName",
                    total:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$group":
                {
                    _id: null,
                    totaldata:
                    {
                        "$sum": "$total"
                    },
                    data:
                    {
                        "$push":
                        {
                            _id: "$_id",
                            total: "$total"
                        }
                    }
                }
            },
            {
                "$unwind":
                {
                    path: "$data"
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
                    _id: "$data._id",
                    persentase:
                    {
                        "$multiply":
                            [
                                {
                                    "$divide":
                                        [
                                            "$data.total", "$totaldata"
                                        ]
                                }, 100
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$_id",
                    persentase:
                    {
                        "$first": "$persentase"
                    }
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            }
        ]);

        return data
    }

    async cekUserjoin(iduser: string) {
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
        },
            {
                $match: {
                    "idUser": new Types.ObjectId(iduser),

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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },
                        ]
                }
            },
            {
                $project: { idUser: 1 }
            });
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }

    async cekUserChalactivity(iduser: string, idevent: string) {
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
        },
            {
                $match: {
                    "idUser": new Types.ObjectId(iduser),
                    'activity.id': idevent

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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },
                        ]
                }
            },);
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }

    async getpemenang2(idchallenge: string, idSubChallenge: string) {
        var pipeline = []
        pipeline.push(
            {
                $match: {
                    idSubChallenge: new Types.ObjectId(idSubChallenge)
                }
            },
            {
                $setWindowFields: {
                    //partitionBy: "$state",
                    sortBy: {
                        score: - 1
                    },
                    output: {
                        rankNew: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            {
                $sort: {
                    rankNew: 1
                }
            },
            {
                "$lookup":
                {
                    from: "newUserBasics",
                    let:
                    {
                        user: "$idUser",

                    },
                    as: 'email',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$_id",
                                                "$$user"
                                            ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                }
                            }
                        ]
                }
            },
            {
                $unwind: {
                    path: "$email"
                }
            },
            {
                "$lookup":
                {
                    from: "challenge",
                    let:
                    {
                        idChallenge: "$idChallenge"
                    },
                    as: 'challenges',
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
                                                            "$_id",
                                                            "$$idChallenge"
                                                        ]
                                                },

                                            },

                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "badge",
                                    let:
                                    {
                                        idBadge: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara1", 0]
                                            }, 0]
                                        },

                                    },
                                    as: 'winner1',
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
                                                                            "$_id",
                                                                            "$$idBadge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },

                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "badge",
                                    let:
                                    {
                                        idBadge: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara2", 0]
                                            }, 0]
                                        },

                                    },
                                    as: 'winner2',
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
                                                                            "$_id",
                                                                            "$$idBadge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },

                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "badge",
                                    let:
                                    {
                                        idBadge: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara3", 0]
                                            }, 0]
                                        },

                                    },
                                    as: 'winner3',
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
                                                                            "$_id",
                                                                            "$$idBadge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },

                                        ]
                                }
                            },

                        ],

                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    ranking: "$rankNew",
                    idUser: "$email._id",
                    email: "$email.email",
                    winnerBadge:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 1]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner1.name", 0]
                                            }, 0]
                                        }
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 2]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner2.name", 0]
                                            }, 0]
                                        }
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 3]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner3.name", 0]
                                            }, 0]
                                        }
                                    },

                                ],
                            default: ""
                        }
                    },
                    idBadge:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 1]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner1._id", 0]
                                            }, 0]
                                        }
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 2]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner2._id", 0]
                                            }, 0]
                                        }
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$rankNew", 3]
                                        },
                                        then: {
                                            $arrayElemAt: [{
                                                $arrayElemAt: ["$challenges.winner3._id", 0]
                                            }, 0]
                                        }
                                    },

                                ],
                            default: ""
                        }
                    },

                },

            }
        );
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }
    async updateUserchallengeRobot(id: string, idSubChallenge: string, score: number,scoreasli:number) {
        this.UserchallengesModel.updateOne(
            {

                _id: new Types.ObjectId(id), idSubChallenge: idSubChallenge
            },
            { $inc: { score: score,maxScore: scoreasli }  },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updatescoreNolChallenge(id: string, updatedAt: string,maxDate:string): Promise<Object> {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id), },
            {
                $set: {
                    "maxScore": 0,
                    "updatedAt": updatedAt,
                    "maxDate":maxDate

                }
            });
        return data;
    }

    async userChallengebyIdChallbot(iduser: string, idchallenge: string,idSubChallenge:string) {
        var query = await this.UserchallengesModel.aggregate([


            {
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
                $match: {
                    "idChallenge": new Types.ObjectId(idchallenge),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),
                    "idUser": new Types.ObjectId(iduser),
                    "isActive": true
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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },

                        ]
                }
            },

            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "ranking": 1,
                    "score": 1,
                    "maxScore":1,
                    "maxDate":1,
                    "isBot":1,
                   
                    "timenow": 1,

                }
            },


        ]);
        return query;
    }
    async userChallengebyIdChallrobot(iduser: string, idchallenge: string,idSubChallenge:string) {
        var query = await this.UserchallengesModel.aggregate([


            {
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
                $match: {
                    "idChallenge": new Types.ObjectId(idchallenge),
                    "idUser": new Types.ObjectId(iduser),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),
                    "isActive": true
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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },

                        ]
                }
            },

            {
                $lookup: {
                    from: 'subChallenge',
                    localField: 'idSubChallenge',
                    foreignField: '_id',
                    as: 'subChallenge_data',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "ranking": 1,
                    "score": 1,
                    "maxScore":1,
                    "maxDate":1,
                    "isBot":1,
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },
                    "timenow": 1,

                }
            },


        ]);
        return query;
    }
}
