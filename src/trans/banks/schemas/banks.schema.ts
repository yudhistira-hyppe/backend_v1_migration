import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BanksDocument = Banks & Document;

@Schema()
export class Banks {
    _id: mongoose.Types.ObjectId;
    @Prop()
    bankcode: string

    @Prop()
    bankname: string

    @Prop()
    bankIcon: string
    @Prop()
    urlEbanking: string
    @Prop()
    atm: string
    @Prop()
    internetBanking: string
    @Prop()
    mobileBanking: string
    @Prop()
    isActive: boolean
    @Prop()
    cekDigit: boolean
    @Prop()
    jmlDigit: number



}

export const BanksSchema = SchemaFactory.createForClass(Banks);