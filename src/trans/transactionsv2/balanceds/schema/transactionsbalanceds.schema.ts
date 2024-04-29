import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsBalancedsDocument = TransactionsBalanceds & Document;

@Schema({ collection: 'transactionsBalanceds' })
export class TransactionsBalanceds {
    _id: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: mongoose.Types.ObjectId;
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    noInvoice: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    userType: string;
    @Prop()
    coa: any[];
    @Prop()
    debit: number;
    @Prop()
    credit: number;
    @Prop()
    saldo: number; 
    @Prop()
    remark: string;
}
export const TransactionsBalancedsSchema = SchemaFactory.createForClass(TransactionsBalanceds);