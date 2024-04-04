import { IsEmail, IsNotEmpty } from "class-validator";
import { LocationDTO } from "../Profile";

export class LoginRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
    location: LocationDTO;
    @IsNotEmpty()
    deviceId: string;
    devicetype: string;
    referral: string;
    imei: string;
    lang: string;
    regSrc: string;
} 

export class RefreshTokenRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    refreshToken: string;
}

export class LogoutRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    deviceId: string;
}

export class DeviceActivityRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    deviceId: string;
    @IsNotEmpty()
    event: string;
    @IsNotEmpty()
    status: string;
}

export class RecoverPasswordRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    otp: string;
    @IsNotEmpty()
    event: string;
    @IsNotEmpty()
    status: string;
}

export class GuestRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    regSrc: string; 
    deviceId: string;
    langIso: string;
    imei: string;
    referral: string;
    location: {
        longitude: string,
        latitude: string
    };
}