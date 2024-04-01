import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LogMigrationsDocument = LogMigrations & Document;

@Schema()
export class LogMigrations {
    _id: mongoose.Types.ObjectId;
    @Prop()
    skip: number;
    @Prop()
    limit: number;
    @Prop()
    limitstop: number;
    @Prop()
    startAt: string;
    @Prop()
    finishAt: string;
    @Prop()
    status: string;
    @Prop()
    type: string;
}
export const LogMigrationsSchema = SchemaFactory.createForClass(LogMigrations);