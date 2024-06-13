import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { integer } from 'aws-sdk/clients/lightsail';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type MediastreamingDocument = Mediastreaming & Document ;

@Schema({ collection: 'mediastreaming' })
export class Mediastreaming{
    _id: mongoose.Types.ObjectId;
    @Prop()
    title: String;
    @Prop()
    url: String;
    @Prop()
    textUrl: String;
    @Prop()
    userId: mongoose.Types.ObjectId;
    @Prop()
    expireTime: Long;
    @Prop()
    startLive: String;
    @Prop()
    endLive: String;
    @Prop()
    status: boolean;
    @Prop()
    view: any[];
    @Prop()
    comment: any[];
    @Prop()
    like: any[];
    @Prop()
    share: any[];
    @Prop()
    shareCount: number;
    @Prop()
    follower: any[];
    @Prop()
    gift: any[];
    @Prop()
    urlStream: String;
    @Prop()
    urlIngest: String;
    @Prop()
    feedBack: String; 
    @Prop()
    feedbackText: String; 
    @Prop()
    createAt: String;
    @Prop()
    feedback: number;
    @Prop()
    pause: boolean;
    @Prop()
    pauseDate: String;
    @Prop()
    kick: any[];
    @Prop()
    commentDisabled: boolean;
    @Prop()
    tokenAgora: String;
    @Prop()
    report: any[];
    @Prop()
    banned: boolean;
    @Prop()
    dateBanned: String;
    @Prop()
    income: number;
    @Prop()
    statusText: String;
    @Prop()
    durasi: any[];
}
export const MediastreamingSchema = SchemaFactory.createForClass(Mediastreaming);