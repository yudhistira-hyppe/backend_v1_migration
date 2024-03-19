import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type transactionCoinDocument = transactionCoin & Document;

@Schema({ collection: 'transactionsCoin' })
export class transactionCoin {

    _id: mongoose.Types.ObjectId;
    @Prop()
    idPackage: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: mongoose.Types.ObjectId;
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    qty: number;
    @Prop()
    status: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}

export const transactionCoinSchema = SchemaFactory.createForClass(transactionCoin);