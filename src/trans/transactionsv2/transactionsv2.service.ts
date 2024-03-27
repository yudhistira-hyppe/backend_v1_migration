import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import {  VaCallback } from './dto/create-transactionv2.dto';
import { transactionsV2, transactionsV2Document } from './schema/transactionsv2.schema';
// import { PostsService } from '../../content/posts/posts.service';
// import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
// import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
// import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
// import { PostContentService } from '../../content/posts/postcontent.service';
// import { type } from 'os';
// import { ConfigService } from '@nestjs/config';
// import { WithdrawsService } from '../withdraws/withdraws.service';
// import { UtilsService } from 'src/utils/utils.service';
// import { OyDisbursementStatus, OyDisbursementStatusResponse } from 'src/paymentgateway/oypg/dto/OyDTO';
// import { OyPgService } from 'src/paymentgateway/oypg/oypg.service';
// import { CreateWithdrawsDto } from '../withdraws/dto/create-withdraws.dto';
// import { Withdraws } from '../withdraws/schemas/withdraws.schema';
// import { CreateAccountbalancesDto } from '../accountbalances/dto/create-accountbalances.dto';
// import { AccountbalancesService } from '../accountbalances/accountbalances.service';

@Injectable()
export class TransactionsV2Service {
    constructor(

        @InjectModel(transactionsV2.name, 'SERVER_FULL')
        private readonly transactionsModel: Model<transactionsV2Document>,
    ) { }
    async findAll(): Promise<transactionsV2[]> {
        return this.transactionsModel.find().exec();
    }
    async findExpired(iduserbuyer: ObjectId): Promise<transactionsV2> {
        return this.transactionsModel.findOne({ status: "WAITING_PAYMENT", iduserbuyer: iduserbuyer }).exec();
    }
    async createNew(transactionsV2_: transactionsV2): Promise<transactionsV2> {
        let data = await this.transactionsModel.create(transactionsV2_);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async updatestatuscancel(id: Types.ObjectId): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Cancel", "description": "VA expired time" } });
        return data;
    }
    async insertTransaction(categoryProduct:string,){

    }
}
