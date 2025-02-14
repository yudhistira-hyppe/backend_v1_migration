import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { String } from 'aws-sdk/clients/codeguruprofiler';
import mongoose, { Document } from 'mongoose';

export type MediaproofpictsDocument = Mediaproofpicts & Document;

@Schema()
export class Mediaproofpicts {
  @Prop()
  _id: String;
  @Prop()
  mediaID: String
  @Prop()
  active: boolean
  @Prop()
  valid: boolean
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop()
  postType: String
  @Prop()
  mediaType: String
  @Prop()
  mediaBasePath: String
  @Prop()
  mediaUri: String
  @Prop()
  originalName: String
  @Prop()
  fsSourceUri: String
  @Prop()
  fsSourceName: String
  @Prop()
  fsTargetUri: String
  @Prop()
  mediaMime: String
  @Prop()
  mediaThumBasePath: String
  @Prop()
  mediaThumUri: String
  @Prop()
  proofpictUploadSource: String;
  @Prop() nama: String
  @Prop() tempatLahir: String
  @Prop() tglLahir: String;
  @Prop() jenisKelamin: String
  @Prop() alamat: String
  @Prop() agama: String
  @Prop() statusPerkawinan: String
  @Prop() pekerjaan: String
  @Prop() kewarganegaraan: String
  @Prop() mediaSelfieType: String
  @Prop() mediaSelfieBasePath: String
  @Prop() mediaSelfieUri: String
  @Prop() SelfieOriginalName: String
  @Prop() SelfiefsSourceUri: String
  @Prop() SelfiefsSourceName: String
  @Prop() SelfiefsTargetUri: String
  @Prop() SelfiemediaMime: String;
  @Prop()
  SelfiemediaThumBasePath: String
  @Prop()
  SelfiemediaThumUri: String
  @Prop()
  SelfieUploadSource: String;

  @Prop() mediaSupportType: String;
  @Prop() mediaSupportBasePath: String;
  @Prop() mediaSupportUri: any[];
  @Prop() SupportOriginalName: any[];
  @Prop() SupportfsSourceUri: any[];
  @Prop() SupportfsSourceName: any[];
  @Prop() SupportfsTargetUri: any[];
  @Prop() SupportmediaMime: String;
  @Prop() mediaSupportUriThumb: any[];
  @Prop()
  SupportUploadSource: String;
  @Prop() status: String;
  @Prop() description: String;
  @Prop()
  idcardnumber: String;
  @Prop()
  _class: String
  @Prop({ type: Object })
  userId: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop() state: String;
  @Prop() kycHandle: any[];
}

export const MediaproofpictsSchema = SchemaFactory.createForClass(Mediaproofpicts);