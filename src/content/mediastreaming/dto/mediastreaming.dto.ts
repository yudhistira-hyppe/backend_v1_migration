import mongoose from "mongoose";
import { Long } from "mongodb";

export class MediastreamingDto {
  _id: mongoose.Types.ObjectId;
  title: String;
  Url: String;
  textUrl: String;
  userId: mongoose.Types.ObjectId;
  expireTime: Long;
  startLive: String;
  endLive: String;
  status: boolean;
  view: any[];
  comment: any[];
  commentPinned: any[];
  like: any[];
  share: any[];
  follower: any[];
  gift: any[];
  urlStream: String;
  urlIngest: String;
  feedBack: String;
  createAt: String;
  type: String;
  messages: String;
  commentDisabled: boolean;
  page: number;
  limit: number;
  feedback: number;
  feedbackText: String;
  pause: boolean;
  idGift: String;
  userIdKick: mongoose.Types.ObjectId;
  viewCountActive: number;
  tokenAgora: String;
  report: any[];
  banned: boolean;
  dateBanned: String;
  idDiscond: String;
}

export class MediastreamingRequestDto{
  _id: mongoose.Types.ObjectId;
  url: String;
  request: {}
  response: {}
  createAt: String;
  updateAt: String;
}

export class CallbackModeration {
  DomainName: String;
  AppName: String;
  StreamName: String;
  OssEndpoint: String;
  OssBucket: String;
  OssObject: String;
  Result: CallbackModerationResult[];
}
export class CallbackModerationResult {
  BizType: String;
  Scene: String;
  Label: String;
  Rate: number; 
  Extent: String;
}
export class RequestSoctDto {
  event: String;
  data: String;
}