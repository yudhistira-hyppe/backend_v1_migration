import mongoose from "mongoose";
import { Long } from "mongodb";

export class MediastreamingDto {
  _id: mongoose.Types.ObjectId;
  title: String;
  url: String;
  urlGift: String;
  urlGiftThum: String;
  idComment: mongoose.Types.ObjectId;
  commentType: String;
  textUrl: String;
  userId: mongoose.Types.ObjectId;
  expireTime: Long;
  startLive: String;
  endLive: String;
  status: boolean;
  view: any[];
  commentAll: any[];
  comment: any[];
  like: any[];
  share: any[];
  shareCount: number;
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
  pauseDate: String;
  pause: boolean;
  idGift: String;
  viewCountActive: number;
  viewCountUnic: number;
  tokenAgora: String;
  report: any[];
  banned: boolean;
  dateBanned: String;
  idDiscond: String;
  pinned: boolean;
  income: number;
  reportRemark: any;
  user: any;
  statusText: String;
  durasi: number;
  liveId: String;
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
export class RequestAppealStream {
  idAppeal: mongoose.Types.ObjectId;
  idStream: mongoose.Types.ObjectId;
  idUser: mongoose.Types.ObjectId;
  title: String;
  messages: String;
  notes: String;
  status: boolean;
  approve: boolean;
  createAt: String;
}
export class RequestConsoleStream {
  liveSearch: String;
  liveDesc: String;
  liveId: String;
  livePeriodeStart: mongoose.Types.ObjectId;
  livePeriodeEnd: String;
  liveDurasi: any[];
  liveView: any[];
  liveGift: any[];
  status: String;
  page: number;
  limit: number;
  sortField: String;
  sort: String;
}
export class RequestConsoleModerationStream {
  dateStart: mongoose.Types.ObjectId;
  dateEnd: String;
  liveDesc: String;
  status: String;
  alasan: String;
  banding: String;
  email: String;
  page: number;
  limit: number;
}