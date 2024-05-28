import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { OyDisburseCallbackWithdraw } from '../dto/create-withdraws.dto';

export type WithdrawsDocument = Withdraws & Document;

@Schema()
export class Withdraws {

    _id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idUser: { oid: string }
    @Prop()
    amount: number
    @Prop()
    status: string
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankVerificationCharge: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankDisbursmentCharge: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    accountBalanceid: { oid: string }
    @Prop()
    timestamp: string
    @Prop()
    updatedAt: string
    @Prop()
    verified: boolean
    @Prop()
    description: string
    @Prop()
    partnerTrxid: string
    @Prop()
    statusOtp: string
    @Prop()
    payload: OyDisburseCallbackWithdraw
    @Prop()
    totalamount: number
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idAccountBank: { oid: string }
    @Prop({ type: Object })
    responOy: {}
    @Prop()
    responseData: any[];
    @Prop()
    statusCode: string;
    @Prop()
    tracking: any[]


}

export const WithdrawsSchema = SchemaFactory.createForClass(Withdraws);