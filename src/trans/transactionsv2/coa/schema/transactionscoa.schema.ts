import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCoaDocument = TransactionsCoa & Document;

@Schema({ collection: 'transactionsCoa' })
export class TransactionsCoa {
    _id: mongoose.Types.ObjectId;
    @Prop()
    coa: string;
    @Prop()
    subCoa: any[];
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    isDelete: boolean;
}
export const TransactionsCoaSchema = SchemaFactory.createForClass(TransactionsCoa);