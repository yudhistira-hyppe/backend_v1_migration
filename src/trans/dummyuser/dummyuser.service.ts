import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Dummyuser, DummyuserDocument } from './schemas/dummyuser.schema';

@Injectable()
export class DummyuserService {

    constructor(
        @InjectModel(Dummyuser.name, 'SERVER_FULL_CRON')
        private readonly DummyuserModel: Model<DummyuserDocument>,
    ) { }

    async create(Dummyuser_: Dummyuser): Promise<Dummyuser> {
        const _Dummyuser_ = await this.DummyuserModel.create(Dummyuser_);
        return _Dummyuser_;
    }

    async findOne(id: string): Promise<Dummyuser> {
        return this.DummyuserModel.findOne({ _id: new Types.ObjectId(id), active: true }).exec();
    }

    async find(): Promise<Dummyuser[]> {
        return this.DummyuserModel.find({ active: true }).exec();
    }

    async findBymail(email: string): Promise<Dummyuser> {
        return await this.DummyuserModel.findOne({ email: email }).exec();
    }

    async findRandom(): Promise<Dummyuser[]> {

        let randomNum = Math.random() * (30 - 20) + 20;

        let x=Number(randomNum).toFixed(0);
        let y=parseInt(x)
        
        return this.DummyuserModel.find({
            $expr: {
                $lt: [0.9, {
                    $rand: {}
                }]
            }
        } ).limit(y).exec();
    }
    async findRandom2(): Promise<Dummyuser[]> {

       // let randomNum = Math.random() * (20 - 10) + 10;
       let randomNum = Math.random() * (1 - 0) + 0;
       let x=Number(randomNum).toFixed(0);
       let y=parseInt(x)
        return this.DummyuserModel.find({
            $expr: {
                $lt: [0.9, {
                    $rand: {}
                }]
            }
        } ).limit(1).exec();
    }


    async getRandom(min, max) {
        const floatRandom = Math.random()
      
        const difference = max - min
      
        // random between 0 and the difference
        const random = Math.round(difference * floatRandom)
      
        const randomWithinRange = random + min
      
        return randomWithinRange
      }

    async update(id: string, Dummyuser_: Dummyuser): Promise<Dummyuser> {
        let data = await this.DummyuserModel.findByIdAndUpdate(id, Dummyuser_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }


        return data;
    }

    async delete(id: string) {
        const data = await this.DummyuserModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.DummyuserModel.updateOne({ "_id": id },
            {
                $set: {
                    "active": false
                }
            });
        return data;
    }


 
}
