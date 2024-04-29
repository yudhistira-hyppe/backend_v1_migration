import { UtilsService } from "../../../utils/utils.service";

export class CreateContenteventsDto {


  _id: String;
  contentEventID: String;
  email: String;
  eventType: String;
  active: boolean;
  event: String;
  createdAt: String;
  updatedAt: String;
  sequenceNumber: Number;
  flowIsDone: boolean;
  senderParty: String;
  receiverParty: String;
  _class: String;
  postID: String;
  reactionUri: String;
  parentContentEventID: String;
  transitions: [
    {
      $ref: String;
      $id: { oid: String };
      $db: String;
    },
  ];
  uniqEvent: any[]
}

export class ContentEventId {
  dtoID: String;
  eventType: String;
  parent: CreateContenteventsDto;
  last: CreateContenteventsDto;
  next: CreateContenteventsDto;
  validActivity: boolean;
}