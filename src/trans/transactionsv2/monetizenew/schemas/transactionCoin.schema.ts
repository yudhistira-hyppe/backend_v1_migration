import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type transactionCoin3Document = transactionCoin3 & Document;

@Schema({ collection: 'transactionsCoin' })
export class transactionCoin3 {

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

export const transactionCoin3Schema = SchemaFactory.createForClass(transactionCoin3);