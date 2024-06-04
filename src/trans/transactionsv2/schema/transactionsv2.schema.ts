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
    category: mongoose.Types.ObjectId;
    @Prop()
    product: mongoose.Types.ObjectId;
    @Prop()
    voucherDiskon: any[];
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    coinDiscount: number;
    @Prop()
    coin: number;
    @Prop()
    totalCoin: number;
    @Prop()
    priceDiscont: number;
    @Prop()
    price: number;
    @Prop()
    totalPrice: number;
    @Prop()
    status: string;
    @Prop()
    detail: any[];
    @Prop()
    remark: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    credit: number;
}
export const transactionsV2Schema = SchemaFactory.createForClass(transactionsV2);