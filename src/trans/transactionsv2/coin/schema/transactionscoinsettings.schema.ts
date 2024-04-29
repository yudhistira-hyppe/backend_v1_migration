import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCoinSettingsDocument = TransactionsCoinSettings & Document;

@Schema({ collection: 'transactionsCoinSettings' })
export class TransactionsCoinSettings {
    _id: mongoose.Types.ObjectId;
    @Prop()
    idUser: mongoose.Types.ObjectId;
    @Prop()
    price: number;
    @Prop()
    status: boolean;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}
export const TransactionsCoinSettingsSchema = SchemaFactory.createForClass(TransactionsCoinSettings);