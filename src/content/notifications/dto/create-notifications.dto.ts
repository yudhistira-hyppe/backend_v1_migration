import mongoose from "mongoose";

export class CreateNotificationsDto {


    _id: String;
    notificationID: String;
    email: String;
    eventType: String;
    event: String;
    mate: String;
    senderOrReceiverInfo: {
        fullName: String;
        avatar: {
            mediaBasePath: String;
            mediaUri: String;
            mediaType: String;
            mediaEndpoint: String;
        };
        username: String;
    };
    title: String;
    titleId: String
    body: String;
    bodyId: String;
    active: boolean;
    flowIsDone: boolean;
    createdAt: String;
    updatedAt: String;
    contentEventID: String;
    postID: String;
    postType: String;
    content: ContentDTO;
    devices: any[];
    actionButtons: String;
    deviceType: String;
    templateID: mongoose.Types.ObjectId;
    statusDevices: any[]
    sendNotifChallenge: string
    streamId: mongoose.Types.ObjectId;
    data: any[]
}

export class ContentDTO {
    apsaraId: string;
    apsaraThumbId: string;
    isApsara: boolean;
    mediaThumbUri: string;
    mediaUri: string;
    mediaEndpoint: string;
    mediaThumbEndpoint: string;
    mediaType: string;
}

export class Messages {
    info: string[];
}

export class NotifResponseApps {
    response_code: number;
    data: CreateNotificationsDto[];
    messages: Messages;
    version: string;
}