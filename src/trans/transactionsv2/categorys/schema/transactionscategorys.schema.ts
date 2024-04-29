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
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    isDelete: boolean;
}
export const TransactionsCategorysSchema = SchemaFactory.createForClass(TransactionsCategorys);