import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BalancedsDocument = Balanceds & Document;

@Schema({ collection: 'transactionsBalanceds' })
export class Balanceds {
    _id: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: mongoose.Types.ObjectId;
    @Prop()
    noInvoice: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    userType: string;
    @Prop()
    user: mongoose.Types.ObjectId;
    @Prop()
    coa: mongoose.Types.ObjectId;
    @Prop()
    debet: number;
    @Prop()
    kredit: number;
    @Prop()
    saldo: number; 
    @Prop()
    remark: string;
}
export const BalancedsSchema = SchemaFactory.createForClass(Balanceds);