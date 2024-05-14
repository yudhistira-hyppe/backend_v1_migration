import { CreateInsightsDto } from "src/content/insights/dto/create-insights.dto";
import { CreateReferralDto } from "src/trans/referral/dto/create-referral.dto";
import { DivisionDto } from "src/trans/usermanagement/division/dto/division.dto";
import { GroupDto } from "src/trans/usermanagement/group/dto/group.dto";

export class ProfileDTO {
    iduser: Object;
    profileID: String;
    username: String;
    password: String;
    fullName: String;
    email: String;
    emailLogin: String;
    langIso: String;
    location: LocationDTO;
    regSrc: String;
    interest: Array<String>;
    bio: String;
    deviceId: String;
    dob: String;
    gender: String;
    idProofNumber: String;
    idProofStatus: String;
    country: String;
    area: String;
    city: String;
    mobileNumber: String;
    eulaID: String;
    isCelebrity: String;
    isIdVerified: String;
    isPrivate: String;
    isFollowPrivate: String;
    isPostPrivate: String;
    isComplete: String;
    group: Object;
    division: Object;
    isEmailVerified: String;
    otp: String;
    otpToken: String;
    event: String;
    status: String;
    oldPass: String;
    newPass: String;
    avatar: AvatarDTO;
    roles: Array<String>;
    authEmail: String;
    token: String;
    refreshToken: String;
    userProfile: String;
    insight: CreateInsightsDto;
    socmedSource: String;
    referral: String;
    imei: String;
    referralCount: String;
    children: Array<CreateReferralDto>;
    listSetting: any[];
    pin_verified: boolean;
    pin_create: boolean;
    statusKyc: String;
    loginSource: String;
    devicetype: String;
    urluserBadge: any[];
    tutor: any[];
    creator: boolean;
    GiftActivation: boolean;
    following: boolean;
    urlLink: string;
    judulLink: string;
}

export class LocationDTO {
    longitude: String;
    latitude: String;
}

export class AvatarDTO {
    profilePict_id: String;
    mediaBasePath: String;
    mediaUri: String;
    mediaType: String;
    mediaEndpoint: String;
}