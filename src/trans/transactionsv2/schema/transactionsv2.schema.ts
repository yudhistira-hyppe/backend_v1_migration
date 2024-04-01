import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type transactionsV2Document = transactionsV2 & Document;

@Schema({ collection: 'transactionsV2' })
export class transactionsV2 {
    _id: mongoose.Types.ObjectId;
    @Prop()
    type: string;
    @Prop()
    idTransaction: string;
    @Prop()
    noInvoice: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    category: mongoose.Types.ObjectId;
    @Prop()
    voucherDiskon: mongoose.Types.ObjectId;
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    coinDiscount: number;
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