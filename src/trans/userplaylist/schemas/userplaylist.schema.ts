import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserplaylistDocument = Userplaylist & Document;

@Schema()
export class Userplaylist {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop({ type: Object })
  userId: { oid: String };
  @Prop([{ type: Object }])
  interestId: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop()
  interestIdCount: number;
  @Prop({ type: Object })
  userPostId: { oid: String };
  @Prop()
  postType: String;
  @Prop()
  mediaId: String;
  @Prop()
  type: String;
  @Prop()
  createAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  isWatched: boolean;
  @Prop()
  isHidden: boolean;
  @Prop()
  postID: String;
  @Prop()
  description: String;
  @Prop()
  expiration: Number;
  @Prop()
  mediaEndpoint: String;
  @Prop()
  mediaThumbEndpoint: String;
  @Prop()
  mediaType: String;
  @Prop()
  mediaThumbUri: String;
  @Prop()
  isApsara: boolean;
  @Prop({ type: Object })
  userBasicData: Object;
  @Prop({ type: Object })
  postData: Object;
  @Prop({ type: Object })
  mediaData: Object;
  @Prop([{ type: Object }])
  viewers: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop({ type: Object })
  username: Object;
  @Prop()
  FRIEND: boolean;
  @Prop()
  FOLLOWER: boolean;
  @Prop()
  FOLLOWING: boolean;
  @Prop()
  PUBLIC: boolean;
  @Prop()
  PRIVATE: boolean; 
}

export const UserplaylistSchema = SchemaFactory.createForClass(Userplaylist);

export type VPlayDocument = VPlay & Document;

@Schema()
export class VPlay {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop({ type: Object })
  userId: { oid: String };
  @Prop([{ type: Object }])
  interestId: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop()
  interestIdCount: number;
  @Prop({ type: Object })
  userPostId: { oid: String };
  @Prop()
  postType: String;
  @Prop()
  mediaId: String;
  @Prop()
  type: String;
  @Prop()
  createAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  isWatched: boolean;
  @Prop()
  isHidden: boolean;
  @Prop()
  postID: String;
  @Prop()
  description: String;
  @Prop()
  expiration: Number;
  @Prop()
  mediaEndpoint: String;
  @Prop()
  mediaThumbEndpoint: String;
  @Prop()
  mediaType: String;
  @Prop()
  mediaThumbUri: String;
  @Prop()
  isApsara: boolean;
  @Prop({ type: Object })
  userBasicData: Object;
  @Prop({ type: Object })
  postData: Object;
  @Prop({ type: Object })
  mediaData: Object;
  @Prop([{ type: Object }])
  viewers: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop({ type: Object })
  username: Object;  
}

export const VPlaySchema = SchemaFactory.createForClass(VPlay);