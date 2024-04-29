import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ContenteventsDocument = Contentevents & Document;

@Schema()
export class Contentevents {
    @Prop()
    _id: String;

    @Prop()
    contentEventID: String
    @Prop()
    email: String
    @Prop()
    eventType: String
    @Prop()
    active: boolean
    @Prop()
    event: String
    @Prop()
    createdAt: String
    @Prop()
    updatedAt: String
    @Prop()
    sequenceNumber: Number
    @Prop()
    flowIsDone: boolean
    @Prop()
    postID: String;
    @Prop()
    senderParty: String;
    @Prop()
    reactionUri: String;
    @Prop()
    receiverParty: String;
    @Prop()
    _class: String
    @Prop()
    parentContentEventID: String;
    @Prop()
    transitions: [
        {
            $ref: String;
            $id: { oid: String };
            $db: String;
        },
    ];

    @Prop()
    uniqEvent: any[]
}

export const ContenteventsSchema = SchemaFactory.createForClass(Contentevents);