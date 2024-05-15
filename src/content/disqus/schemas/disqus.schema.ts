import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DisqusDocument = Disqus & Document ;

@Schema()
export class Disqus {
 @Prop()
 _id:String;

  @Prop()
  disqusID: String
  @Prop()
  email: String
  @Prop()
  mate: String
  @Prop()
  eventType: String
  @Prop()
  active: boolean
  @Prop()
  room: String
  @Prop()
postID: String
@Prop()
streamID: String  
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
lastestMessage: String
@Prop()
    emailActive: boolean
    @Prop()
    mateActive: boolean
 @Prop()
 disqusLogs: any[];
 @Prop()
_class: String
@Prop()
    txtMessages: String
    @Prop()
    idtransaction: mongoose.Types.ObjectId;
} 

export const DisqusSchema = SchemaFactory.createForClass(Disqus);