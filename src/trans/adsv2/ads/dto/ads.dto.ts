import { double } from "aws-sdk/clients/lightsail";
import { IsNotEmpty } from "class-validator";
import mongoose, { ObjectId } from "mongoose";

export class AdsDto {
    _id: mongoose.Types.ObjectId;
    adsIdNumber: string;
    adsObjectivitasId: mongoose.Types.ObjectId;
    campaignId: string;
    name: string;
    typeAdsID: mongoose.Types.ObjectId;
    skipTime: number;
    placingID: mongoose.Types.ObjectId;
    dayAds: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    timeAds: {
        time_4_8: boolean;
        time_8_12: boolean;
        time_12_16: boolean;
        time_16_20: boolean;
        time_20_24: boolean;
        time_24_4: boolean;
    };
    liveAt: string;
    liveEnd: string;
    tayang: number;
    credit: number;
    demografisID: any[];
    interestID: any[];
    audiensFrekuensi: number;
    gender: any[];
    age: {
        age_smaller_than_14: boolean;
        age_14_smaller_than_28: boolean;
        age_29_smaller_than_43: boolean;
        age_greater_than_44: boolean;
        age_other: boolean;
    };
    userID: mongoose.Types.ObjectId;
    userIDAssesment: mongoose.Types.ObjectId;
    type: string;
    urlLink: string;
    ctaButton: number;
    description: string;
    status: string;
    statusDescription: string;
    isActive: boolean;

    updatedAt: string;
    createdAt: string;
    timestamp: string;

    totalClick: number;
    totalView: number;

    userVoucherID: [];
    usedCredit: number;
    usedCreditFree: number;
    creditFree: number;
    creditValue: number;
    totalCredit: number;
    totalUsedCredit: number;

    idApsara: string;
    duration: double;
    sizeFile: double;

    idApsaraPortrait: string;
    sizeFilePortrait: double;

    idApsaraLandscape: string;
    sizeFileLandscape: double;

    reportedStatus: string;
    reportedUserCount: number;
    reportedUser: any[];
    contentModeration: boolean;
    contentModerationResponse: string;
    reportedUserHandle: any[];

    objectifitas: string;
    mediaAds: { oid: String; };
    liveTypeAds: boolean;
    endAge: number;
    startAge: number;
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
    idAdspricecredits: mongoose.Types.ObjectId;
    adspricecredits: number;
    CPA: number;
    CPV: number;
    idTransactionCreate: string;
    idTransactionEnd: string;
    idTransactionSharing: [];
}

export class AdsAction {
    watchingTime: number;
    adsId: mongoose.Types.ObjectId;
    useradsId: mongoose.Types.ObjectId;
}