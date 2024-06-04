import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NotificationsDocument = Notifications & Document;

@Schema()
export class Notifications {
  @Prop()
  _id: String;
  @Prop()
  notificationID: String
  @Prop()
  email: String
  @Prop()
  eventType: String
  @Prop()
  event: String
  @Prop()
  mate: String
  @Prop({ type: Object })
  senderOrReceiverInfo: {
    fullName: String
    avatar: {
      mediaBasePath: String
      mediaUri: String
      mediaType: String
      mediaEndpoint: String
    };
    username: String
  }
  @Prop()
  title: String
  @Prop()
  titleId: String
  @Prop()
  body: String
  @Prop()
  bodyId: String
  @Prop()
  active: boolean
  @Prop()
  flowIsDone: boolean
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop()
  contentEventID: String
  @Prop()
  postID: String
  @Prop([])
  devices: any[]
  @Prop()
  actionButtons: String
  @Prop()
  deviceType: String
  @Prop()
  templateID: mongoose.Types.ObjectId;
  @Prop([])
  statusDevices: any[]
  @Prop()
  sendNotifChallenge: string
  @Prop()
  streamId: mongoose.Types.ObjectId;
  @Prop()
  postType: String
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);