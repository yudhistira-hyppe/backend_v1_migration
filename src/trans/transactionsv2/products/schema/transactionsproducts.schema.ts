import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsProductsDocument = TransactionsProducts & Document;

@Schema({ collection: 'transactionsProducts' })
export class TransactionsProducts {
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
export const TransactionsProductsSchema = SchemaFactory.createForClass(TransactionsProducts);