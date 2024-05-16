import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsDiscountsDocument = TransactionsDiscounts & Document;

@Schema({ collection: 'transactionsDiscounts' })
export class TransactionsDiscounts {
    _id: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: mongoose.Types.ObjectId;
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    totalPayment: number;
    @Prop()
    transactionDate: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}
export const TransactionsDiscountsSchema = SchemaFactory.createForClass(TransactionsDiscounts);