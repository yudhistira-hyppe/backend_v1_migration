import { ObjectId } from "mongoose";

export class CreateAdsDto {


    _id: { oid: String; };
    userID: { oid: String; };
    userIDAssesment: { oid: String; };
    adsIdNumber: string;
    // demografisID: {
    //     $ref: String;
    //     $id: { oid: String };
    //     $db: String;
    // };
    demografisID: any[];
    interestID: any[];
    typeAdsID: { oid: String; };
    placingID: { oid: String; };
    description: string;
    expiredAt: string;
    gender: any[];
    liveAt: string;
    name: string;
    objectifitas: string;
    status: string;
    timestamp: string;
    totalClick: number;
    totalUsedCredit: number;
    totalView: number;
    urlLink: string;
    userVoucherID: any[];
    isActive: boolean;
    type: string;
    mediaAds: { oid: String; };
    tayang: number;
    endAge: number;
    startAge: number;
    usedCredit: number;
    usedCreditFree: number;
    creditFree: number;
    creditValue: number;
    totalCredit: number;
    liveTypeAds: boolean;
    idApsara: string;
    duration: number;
    idApsaraPortrait: string;
    idApsaraLandscape: string;
    reportedStatus: string
    reportedUserCount: number
    reportedUser: any[];
    contentModeration: boolean
    contentModerationResponse: string
    reportedUserHandle: any[];
    age: string;
    updatedAt: string;
    skipTime: number;
    remark: string;

    mediaBasePath: string;
    mediaUri: string;
    mediaThumBasePath: string;
    mediaThumUri: string;
    width: number;
    height: number;
    mediaPortraitBasePath: string;
    mediaPortraitUri: string;
    mediaPortraitThumBasePath: string;
    mediaPortraitThumUri: string;
    widthPortrait: number;
    heightPortrait: number;
    mediaLandscapeBasePath: string;
    mediaLandscapeUri: string;
    mediaLandscapeThumBasePath: string;
    mediaLandscapeThumUri: string;
    widthLandscape: number;
    heightLandscape: number;

    adspricecredits: number;
    CPA: number;
    CPV: number;
    idTransactionCreate: string;
    idTransactionEnd: string;
    idTransactionSharing: any[];
}

export class MediaimageadsDto {

    // readonly _id: String;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    fsSourceName: string;
    fsSourceUri: string;
    fsTargetUri: string;
    mediaBasePath: string;
    mediaMime: string;
    mediaType: string;
    mediaUri: string;
    originalName: string;
    imageId: string;
}

export class MediavodeosadsDto {

    // readonly _id: String;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    fsSourceName: string;
    fsSourceUri: string;
    fsTargetThumbUri: string;
    fsTargetUri: string;
    mediaBasePath: string;
    mediaMime: string;
    mediaThumb: string;
    mediaType: string;
    mediaUri: string;
    originalName: string;
    videoId: string;
    duration: number;
    rotate: number;
}

export class CreateAdsResponse {
    response_code: number;
    messages: String;
    data: any;
}  