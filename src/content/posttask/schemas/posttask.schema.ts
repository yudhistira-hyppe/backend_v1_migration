import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type PosttaskDocument = Posttask & Document;

@Schema({ collection: 'postTask' })
export class Posttask {
    _id: mongoose.Types.ObjectId;
    @Prop()
    postID: string;
    @Prop()
    email: string;
    @Prop()
    viewCount: number;
    @Prop()
    likeCount: number;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    active: boolean;
    @Prop()
    totalInject: number;
  
   
}
export const PosttaskSchema = SchemaFactory.createForClass(Posttask)