import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MonetizenewDocument = Monetizenew & Document;

@Schema({ collection: 'monetize' })
export class Monetizenew {

    _id: mongoose.Types.ObjectId;
    @Prop()
    type: string;
    @Prop()
    name: string;
    @Prop()
    code_package: string;
    @Prop()
    redirectUrl: string;
    @Prop()
    description: string;
    @Prop()
    package_id: string;
    @Prop()
    price: number;
    @Prop()
    amount: number;
    @Prop()
    stock: number;
    @Prop()
    thumbnail: string;
    @Prop()
    animation: string;
    @Prop()
    audiens: string;
    @Prop()
    audiens_user: any[];
    @Prop()
    typeGift: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    title: string;
    @Prop()
    body_message: string;
    @Prop()
    isSend: boolean;
    @Prop()
    used_stock: number;
    @Prop()
    last_stock: number;
    @Prop()
    min_discount: number;
    @Prop()
    min_use_disc: number;
    @Prop()
    active: boolean;
    @Prop()
    status: boolean;
    @Prop()
    startCouponDate: string;
    @Prop()
    endCouponDate: string;
    @Prop()
    productID: mongoose.Types.ObjectId;
    @Prop()
    productCode: string;
}

export const monetizenewSchema = SchemaFactory.createForClass(Monetizenew);