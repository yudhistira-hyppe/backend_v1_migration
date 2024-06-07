import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb"

export type UserbasicnewDocument = Userbasicnew & Document;

@Schema({ collection: 'newUserBasics' })
export class Userbasicnew {
    _id: mongoose.Types.ObjectId;
    @Prop()
    profileID: string;
    @Prop()
    email: String;
    @Prop()
    emailLogin: String;
    @Prop()
    fullName: String;
    @Prop()
    dob: String;
    @Prop()
    gender: String;
    @Prop()
    regSrc: String;
    @Prop()
    loginSrc: String;
    @Prop()
    loginSource: String;
    @Prop()
    mobileNumber: String;
    @Prop()
    status: String;
    @Prop()
    event: String;
    @Prop()
    idProofName: String;
    @Prop()
    idProofNumber: String;
    @Prop()
    idProofStatus: String;
    @Prop()
    isComplete: boolean;
    @Prop()
    isCelebrity: boolean;
    @Prop()
    isIdVerified: boolean;
    @Prop()
    isPrivate: boolean;
    @Prop()
    isFollowPrivate: boolean;
    @Prop()
    isPostPrivate: boolean;

    @Prop()
    createdAt: String;
    @Prop()
    updatedAt: String;
    @Prop()
    bio: String;
    @Prop({ type: Object })
    profilePict: any;
    @Prop({ type: Object })
    proofPict: {
        $ref: String;
        $id: String;
        $db: String;
    };
    @Prop({ type: Object })
    insight: {
        $ref: String;
        $id: {
            oid: String;
        };
        $db: String;
    };
    @Prop()
    userInterests: any[];
    @Prop({ type: Object })
    cities: {
        $ref: String;
        $id: {
            oid: String;
        };
        $db: String;
    };
    @Prop({ type: Object })
    states: {
        $ref: String;
        $id: {
            oid: String;
        };
        $db: String;
    };
    @Prop({ type: Object })
    countries: {
        $ref: String;
        $id: {
            oid: String;
        };
        $db: String;
    };
    @Prop({ type: Object })
    languages: {
        $ref: String;
        $id: {
            oid: String;
        };
        $db: String;
    };
    @Prop()
    _class: String;
    @Prop()
    pin: String;
    @Prop()
    otp_pin: String;
    @Prop()
    otpToken: String;

    @Prop()
    otp_expired_time: Long;
    @Prop()
    otppinVerified: boolean;
    @Prop()
    statusKyc: string;
    @Prop()
    timeEmailSend: string;
    @Prop()
    reportedStatus: string
    @Prop()
    reportedUserCount: number
    @Prop()
    reportedUser: any[];
    @Prop()
    reportedUserHandle: any[];
    @Prop()
    listAddKyc: any[];
    @Prop()
    userAssets: any[];
    @Prop()
    import: String;
    @Prop()
    userBadge: any[];
    @Prop()
    tutor: any[];
    @Prop()
    userEvent: string;
    @Prop()
    following: any[];
    @Prop()
    follower: any[];
    @Prop()
    tempfollowing: any[];
    @Prop()
    tempfollower: any[];
    @Prop()
    friend: any[];
    @Prop()
    citiesName: string;
    @Prop()
    statesName: string;
    @Prop()
    countriesName: string;
    @Prop()
    languagesLang: string;
    @Prop()
    languagesLangIso: string;
    @Prop()
    _idAuth: mongoose.Types.ObjectId;
    @Prop()
    username: string;
    @Prop()
    password: string;
    @Prop()
    userID: string;
    @Prop()
    isExpiryPass: boolean;
    @Prop()
    isEmailVerified: boolean;
    // @Prop({ type: Object })
    // otpRequestTime: {
    //     numberLong: String;
    // };
    // @Prop({ type: Object })
    // otpAttempt: {
    //     numberLong: String;
    // };
    // @Prop({ type: Object })
    // otpNextAttemptAllow: {
    //     numberLong: String;
    // };
    @Prop()
    otpRequestTime: Long;
    @Prop()
    otpAttempt: Long;
    @Prop()
    otpNextAttemptAllow: Long;
    @Prop()
    oneTimePassword: string;
    @Prop({ type: Object })
    location: any;
    @Prop()
    isEnabled: boolean;
    @Prop()
    isAccountNonExpired: boolean;
    @Prop()
    isAccountNonLocked: boolean;
    @Prop()
    isCredentialsNonExpired: boolean;
    @Prop()
    roles: any[]
    @Prop({ type: Object })
    authUsers: any;
    @Prop()
    _idAvatar: string;
    @Prop()
    mediaType: string;
    @Prop()
    mediaBasePath: string;
    @Prop()
    mediaUri: string;
    @Prop()
    originalName: string;
    @Prop()
    fsSourceUri: string;
    @Prop()
    fsSourceName: string;
    @Prop()
    fsTargetUri: string;
    @Prop()
    mediaEndpoint: string;
    @Prop()
    kyc: any[]
    @Prop()
    referral: any[]
    @Prop()
    guestMode: boolean;
    @Prop()
    uploadSource: string;
    @Prop()
    mediaThumBasePath: string;
    @Prop()
    mediaThumName: string;
    @Prop()
    mediaMime: string;
    @Prop()
    mediaThumUri: string;
    @Prop()
    postType: string;
    @Prop()
    creator: boolean;
    @Prop()
    otp_attemp: number;
    @Prop()
    urlLink: string;
    @Prop()
    judulLink: string;
    @Prop()
    GiftActivation: boolean;
    @Prop()
    streamReportUser: any[];
    @Prop()
    streamHystoryWarning: any[];
    @Prop()
    streamWarning: any[];
    @Prop()
    streamBanding: any[];
    @Prop()
    streamBanned: boolean;
    @Prop()
    streamBannedDate: string;
}

export const UserbasicnewSchema = SchemaFactory.createForClass(Userbasicnew);