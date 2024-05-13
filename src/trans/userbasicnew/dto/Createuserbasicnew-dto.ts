import { IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";
export class CreateuserbasicnewDto {
  _id: mongoose.Types.ObjectId;
  profileID: string;
  email: String;
  emailLogin: string;
  fullName: String;
  dob: String;
  gender: String;
  regSrc: String;
  loginSource: String;
  loginSrc: String;
  mobileNumber: String;
  status: String;
  event: String;
  idProofName: String;
  idProofNumber: String;
  idProofStatus: String;
  isComplete: boolean;
  isCelebrity: boolean;
  isIdVerified: boolean;
  isPrivate: boolean;
  isFollowPrivate: boolean;
  isPostPrivate: boolean;
  createdAt: String;
  updatedAt: String;
  bio: String;
  profilePict: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  proofPict: {
    $ref: String;
    $id: String;
    $db: String;
  };
  insight: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  userInterests: any[];
  referral: any[];
  authUsers: {
    "devices": any[],
  };
  cities: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  states: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  countries: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  languages: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  _class: String;
  pin: String;
  otp_pin: String;
  otpToken: String;
  otppinVerified: boolean;
  statusKyc: string;
  timeEmailSend: string;
  reportedStatus: string;
  reportedUserCount: number;
  reportedUser: any[];
  reportedUserHandle: any[];
  listAddKyc: any[];
  userAssets: any[];
  import: String;
  userBadge: any[];
  tutor: any[];
  userEvent: string;
  following: any[];
  follower: any[];
  tempfollowing: any[];
  tempfollower: any[];
  citiesName: string;
  statesName: string;
  countriesName: string;
  languagesLang: string;
  languagesLangIso: string;
  _idAuth: mongoose.Types.ObjectId;
  username: string;
  password: string;
  userID: string;
  isExpiryPass: boolean;
  isEmailVerified: boolean;
  otpRequestTime: Long;
  otpAttempt: Long;
  otpNextAttemptAllow: Long;
  oneTimePassword: string;
  location: any;
  isEnabled: boolean;
  isAccountNonExpired: boolean;
  isAccountNonLocked: boolean;
  isCredentialsNonExpired: boolean;
  roles: any[];
  _idAvatar: string;
  mediaType: string;
  mediaBasePath: string;
  mediaUri: string;
  originalName: string;
  fsSourceUri: string;
  fsSourceName: string;
  fsTargetUri: string;
  mediaEndpoint: string;
  uploadSource: string;
  mediaThumBasePath: string;
  mediaThumName: string;
  mediaMime: string;
  mediaThumUri: string;
  postType: string;
  kyc: any[];
  guestMode: boolean;
  friend: any[];
  creator: boolean
  otp_attemp: number;
  otp_request_time: Long;
  otp_expired_time: Long;
  urlLink: string;
  judulLink: string;
  GiftActivation: boolean;
}

export class SearchUserbasicDto {
  @IsString()
  @IsNotEmpty()
  search: String;
  pageRow: number;
  pageNumber: number;
}