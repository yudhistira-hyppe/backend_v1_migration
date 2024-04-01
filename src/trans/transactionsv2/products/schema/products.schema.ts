import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductsDocument = Products & Document;

@Schema({ collection: 'transactionsProducts' })
export class Products {
    _id: mongoose.Types.ObjectId;
    @Prop()
    code: string;
    @Prop()
    name: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    isDelete: boolean;
}
export const ProductsSchema = SchemaFactory.createForClass(Products);