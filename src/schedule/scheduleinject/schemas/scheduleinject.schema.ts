import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type ScheduleinjectDocument = Scheduleinject & Document;

@Schema({ collection: 'scheduleInject' })
export class Scheduleinject {
    _id: mongoose.Types.ObjectId;
    @Prop()
    postID: string;
    @Prop()
    emailPost: string;
    @Prop()
    time: any[];
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}
export const ScheduleinjectSchema = SchemaFactory.createForClass(Scheduleinject)