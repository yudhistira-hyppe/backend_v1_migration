import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCategorysDocument = TransactionsCategorys & Document;

@Schema({ collection: 'transactionsCategorys' })
export class TransactionsCategorys {
    _id: mongoose.Types.ObjectId;
    @Prop()
    code: string
    @Prop()
    coa: string;
    @Prop()
    type: any[];
    @Prop()
    user: string;
    @Prop()
    transaction: any[];
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    isDelete: boolean;
    @Prop()
    idProduct: mongoose.Types.ObjectId[];
}
export const TransactionsCategorysSchema = SchemaFactory.createForClass(TransactionsCategorys);