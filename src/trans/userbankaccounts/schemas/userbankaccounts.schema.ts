import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserbankaccountsDocument = Userbankaccounts & Document;

@Schema()
export class Userbankaccounts {

    _id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idBank: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    userId: { oid: string }
    @Prop()
    noRek: string
    @Prop()
    nama: string
    @Prop()
    statusInquiry: boolean
    @Prop()
    description: string
    @Prop()
    active: boolean
    @Prop() userHandle: any[];
    @Prop() mediaSupportType: String;
    @Prop() mediaSupportBasePath: String;
    @Prop() mediaSupportUri: any[];
    @Prop() SupportOriginalName: any[];
    @Prop() SupportfsSourceUri: any[];
    @Prop() SupportfsSourceName: any[];
    @Prop() SupportfsTargetUri: any[];
    @Prop() SupportmediaMime: String;
    @Prop() createdAt: string;
    @Prop() updatedAt: string;
    @Prop()
    SupportUploadSource: string
    @Prop()
    similarity: number



}

export const UserbankaccountsSchema = SchemaFactory.createForClass(Userbankaccounts);