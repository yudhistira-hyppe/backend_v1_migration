import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type transactionsV2Document = transactionsV2 & Document;

@Schema({ collection: 'transactionsV2' })
export class transactionsV2 {
    _id: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: mongoose.Types.ObjectId;
    @Prop()
    type: string;
    @Prop()
    noInvoice: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    category: mongoose.Types.ObjectId;
    @Prop()
    coin: number;
    @Prop()
    totalCoin: number;
    @Prop()
    status: string;
    @Prop()
    detail: any[];
    @Prop()
    remark: string;
}
export const transactionsV2Schema = SchemaFactory.createForClass(transactionsV2);