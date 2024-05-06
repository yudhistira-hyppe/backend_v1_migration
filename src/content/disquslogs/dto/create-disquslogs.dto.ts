import mongoose from "mongoose";

export class CreateDisquslogsDto {
  

     _id: String;
     disqusID: String;
     sequenceNumber: Number;
     sender: String;
     receiver: String;
     active: boolean;
     eventInsight: String;
      postType: String;
      postID: String;
      createdAt: String;
      updatedAt: String;
      reactionUri: String;
    txtMessages: String;
  parentID: String;
    
      medias: any[];
  replyLogs: [
    {
      $ref: String;
      $id: String;
      $db: String;
    },
  ];
  tags:[
    {
      $ref: String;
      $id: {
        oid: String
      };
      $db: String;
    },
  ];
     _class: String;
    receiverActive: boolean;
  senderActive: boolean;
  idtransaction: mongoose.Types.ObjectId;
  giftData: any[];
  }


  export class DisquslogsDto {
  
    _id: String;
    disqusID: String;
    sequenceNumber: Number;
    sender: {};
    receiver: String;
    active: boolean;
    eventInsight: String;
    postType: String;
    postID: String;
    createdAt: String;
    updatedAt: String;
    reactionUri: String;
    txtMessages: String; 
    lineID: String;
    medias: any[];
   
    readonly _class: String;
    receiverActive: boolean;
    senderActive: boolean;
    senderInfo: {};
    replyLogs: [
      {
        $ref: String;
        $id: String;
        $db: String;
      },
    ];
    username: String;
 }