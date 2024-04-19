import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type HistoryuserDocument = Historyuser & Document;

@Schema({ collection: 'historyUser' })
export class Historyuser {
    _id: mongoose.Types.ObjectId;
    @Prop()
    postID: string;
    @Prop()
    email: string;
    @Prop()
    event: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    sessionJam: string;
    @Prop()
    sendFcm: boolean;
   
}
export const HistoryuserSchema = SchemaFactory.createForClass(Historyuser)