import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCreditsDocument = TransactionsCredits & Document;

@Schema({ collection: 'transactionsCredits' })
export class TransactionsCredits {
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
    voucherDiskon: any[];
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    creditDiscount: number;
    @Prop()
    credit: number;
    @Prop()
    totalCredit: number;
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
}
export const TransactionsCreditsSchema = SchemaFactory.createForClass(TransactionsCredits);