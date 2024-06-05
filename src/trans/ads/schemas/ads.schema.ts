import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsDocument = Ads & Document;

@Schema()
export class Ads {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    adsObjectivitasId: mongoose.Types.ObjectId;
    @Prop()
    adsIdNumber: string;
    @Prop()
    campaignId: string;
    @Prop()
    name: string;
    @Prop({ type: Object })
    typeAdsID: { oid: String; };
    @Prop()
    skipTime: number;
    @Prop({ type: Object })
    placingID: { oid: String; };
    @Prop({ type: Object })
    dayAds: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    @Prop({ type: Object })
    timeAds: {
        time_4_8: boolean;
        time_8_12: boolean;
        time_12_16: boolean;
        time_16_20: boolean;
        time_20_24: boolean;
        time_24_4: boolean;
    };
    @Prop()
    liveAt: string;
    @Prop()
    liveEnd: string;
    @Prop()
    tayang: number;
    @Prop()
    credit: number;
    @Prop([{ type: Object }])
    demografisID: [
        {
            ref: String;
            id: mongoose.Types.ObjectId;
            db: String;
        },
    ];
    @Prop([{ type: Object }])
    interestID: [
        {
            ref: String;
            id: {
                oid: String;
            };
            db: String;
        },
    ];
    @Prop()
    audiensFrekuensi: number;
    @Prop()
    gender: any[];
    @Prop({ type: Object })
    age: {
        age_smaller_than_14: boolean;
        age_14_smaller_than_28: boolean;
        age_29_smaller_than_43: boolean;
        age_greater_than_44: boolean;
        age_other: boolean;
    };
    @Prop({ type: Object })
    userID: { oid: String; };
    @Prop({ type: Object })
    userIDAssesment: { oid: String; };
    @Prop()
    type: string;
    @Prop()
    urlLink: string;
    @Prop()
    ctaButton: number;
    @Prop()
    description: string;
    @Prop()
    status: string;
    @Prop()
    statusDescription: string;
    @Prop()
    isActive: boolean;
    // @Prop({ type: Object })
    // demografisID: {
    //     $ref: String;
    //     $id: { oid: String };
    //     $db: String;
    // };

    @Prop()
    createdAt: string;
    @Prop()
    expiredAt: string;
    @Prop()
    timestamp: string;

    @Prop([])
    userVoucherID: [];
    @Prop()
    usedCredit: number;
    @Prop()
    usedCreditFree: number;
    @Prop()
    creditFree: number;
    @Prop()
    creditValue: number;
    @Prop()
    totalCredit: number;
    @Prop()
    totalUsedCredit: number;

    @Prop()
    idApsara: string;
    @Prop()
    duration: number;
    @Prop()
    sizeFile: number;

    @Prop()
    idApsaraPortrait: string;
    @Prop()
    sizeFilePortrait: number;

    @Prop()
    idApsaraLandscape: string;
    @Prop()
    sizeFileLandscape: number;

    @Prop()
    reportedStatus: string
    @Prop()
    reportedUserCount: number
    @Prop()
    reportedUser: any[];
    @Prop()
    contentModeration: boolean
    @Prop()
    contentModerationResponse: string
    @Prop()
    reportedUserHandle: any[];

    @Prop()
    objectifitas: string;
    @Prop({ type: Object })
    mediaAds: { oid: String; };
    @Prop()
    liveTypeAds: boolean;

    @Prop()
    totalClick: number;
    @Prop()
    totalView: number;
    @Prop()
    endAge: number;
    @Prop()
    startAge: number;
    @Prop()
    updatedAt: string;
    @Prop()
    remark: string;

    @Prop()
    mediaBasePath: string;
    @Prop()
    mediaUri: string;
    @Prop()
    mediaThumBasePath: string;
    @Prop()
    mediaThumUri: string;
    @Prop()
    width: number;
    @Prop()
    height: number;
    @Prop()
    mediaPortraitBasePath: string;
    @Prop()
    mediaPortraitUri: string;
    @Prop()
    mediaPortraitThumBasePath: string;
    @Prop()
    mediaPortraitThumUri: string;
    @Prop()
    widthPortrait: number;
    @Prop()
    heightPortrait: number;
    @Prop()
    mediaLandscapeBasePath: string;
    @Prop()
    mediaLandscapeUri: string;
    @Prop()
    mediaLandscapeThumBasePath: string;
    @Prop()
    mediaLandscapeThumUri: string;
    @Prop()
    widthLandscape: number;
    @Prop()
    heightLandscape: number;
    @Prop()
    idAdspricecredits: mongoose.Types.ObjectId;

    @Prop()
    adspricecredits: number;
    @Prop()
    CPA: number;
    @Prop()
    CPV: number;
    @Prop()
    idTransactionCreate: string;
    @Prop()
    idTransactionEnd: string;
    @Prop()
    idTransactionSharing: any[];
}

export const AdsSchema = SchemaFactory.createForClass(Ads);