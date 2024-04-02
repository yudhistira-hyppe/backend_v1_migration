import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReferralDocument = Referral & Document ;

@Schema({ collection: 'referral' })
export class Referral {
  @Prop()
  _id: string
  @Prop()
  parent: string
  @Prop()
  children: String
  @Prop()
  active: boolean
  @Prop()
  status: String
  @Prop()
  verified: boolean
  @Prop()
  imei: String
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop({ default: 'io.melody.core.domain.Referral',select: false })
  _class: String
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);