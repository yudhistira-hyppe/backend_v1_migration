import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { VaCallback } from '../dto/create-transactions.dto';

export type TransactionsDocument = Transactions & Document;

@Schema()
export class Transactions {

    _id: mongoose.Types.ObjectId;
    @Prop()
    noinvoice: string
    @Prop()
    postid: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idusersell: { oid: String }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    iduserbuyer: { oid: String }
    @Prop()
    amount: number
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    paymentmethod: { oid: String }

    @Prop()
    status: string
    @Prop()
    description: string
    @Prop()
    nova: string
    @Prop()
    expiredtimeva: string

    @Prop()
    salelike: boolean
    @Prop()
    saleview: boolean
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bank: { oid: String }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    ppn: { oid: String }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    mdradmin: { oid: String }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankvacharge: { oid: String }
    @Prop()
    totalamount: number
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    accountbalance: { oid: String }
    @Prop()
    timestamp: string
    @Prop()
    updatedAt: string
    @Prop()
    payload: VaCallback
    @Prop()
    idva: string
    @Prop()
    type: string
    @Prop([])
    detail: [];
    @Prop({ type: Object })
    response: {}
    @Prop([])
    voucherpromo: any[];
    @Prop([])
    datavoucherpromo: any[];
    @Prop()
    productCode: string
    @Prop()
    platform: string

}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);