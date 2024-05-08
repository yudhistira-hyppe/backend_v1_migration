import { ObjectId } from "mongodb";
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";
export class CreateTransactionsNewDto {

    noinvoice: string;
    postid: string;
    idusersell: mongoose.Types.ObjectId;
    iduserbuyer: mongoose.Types.ObjectId;
    amount: number;
    paymentmethod: { oid: String; };
    status: string;
    description: string;
    nova: string;
    salelike: boolean;
    saleview: boolean;
    bank: { oid: String; };
    ppn: { oid: String; };
    mdradmin: { oid: String; };
    bankvacharge: { oid: String; };
    totalamount: number;
    accountbalance: { oid: String; };
    timestamp: string;
    expiredtimeva: string;
    payload: VaCallback;
    idva: string;
    type: string;
    detail: any[];
    response: {};
    updatedAt: string;
    voucherpromo: any[];
    datavoucherpromo: any[];
    productCode: string;
    platform: string

}

export class CreateTransactionsDto {

    noinvoice: string;
    postid: string;
    idusersell: { oid: String; };
    iduserbuyer: { oid: String; };
    amount: number;
    paymentmethod: { oid: String; };
    status: string;
    description: string;
    nova: string;
    salelike: boolean;
    saleview: boolean;
    bank: { oid: String; };
    ppn: { oid: String; };
    mdradmin: { oid: String; };
    bankvacharge: { oid: String; };
    totalamount: number;
    accountbalance: { oid: String; };
    timestamp: string;
    expiredtimeva: string;
    payload: VaCallback;
    idva: string;
    type: string;
    detail: any[];
    response: {};
    updatedAt: string;
    voucherpromo: any[];
    datavoucherpromo: any[];

}
export class Uservoucher {

    userID: { oid: String; };
    voucherID: { oid: String; };
    createdAt: string;
    isActive: boolean;
    voucherCredit: number;
    totalCredit: number;
    updatedAt: string;
    expiredAt: string;
    jmlVoucher: number;
    credit: number;
    creditFree: number;
    usedCredit: number;
    usedCreditFree: number;

}
export class VaCallback {
    va_number: string;
    amount: number;
    partner_user_id: string;
    success: boolean;
    tx_date: string;
    username_display: string;
    trx_expiration_date: string;
    partner_trx_id: string;
    trx_id: string;
    settlement_time: string;
    settlement_status: string;
}

export class OyAccountInquirys {
    bank_code: string;
    account_number: string;
}

export class OyDisbursements {
    recipient_bank: string;
    recipient_account: string;
    amount: number;
    note: string;
    partner_trx_id: string;
    email: string;
    pin: number;
}
export class OyDisbursementStatus2 {
    partner_trx_id: string;
}
export class CreateWithdraws {
    readonly _id: { oid: string; };
    idUser: { oid: String; };
    amount: number;
    status: string;
    bankVerificationCharge: { oid: String; };
    bankDisbursmentCharge: { oid: String; };
    accountBalanceid: { oid: String; };
    timestamp: string;
    verified: boolean;
    description: string;
    partnerTrxid: string;
    statusOtp: string;
    totalamount: number;
    idAccountBank: { oid: String; };
    updatedAt: string;
    responOy: {};
    responseData: any[];
    statusCode: string;
}
export class OyDisburseCallbacks {

    status: StatusCallback;
    tx_status_description: string;
    amount: number;
    recipient_name: string;
    recipient_bank: string;
    recipient_account: string;
    trx_id: string;
    partner_trx_id: string;
    timestamp: string;
    created_date: string;
    last_updated_date: string;
}

export class StatusCallback {
    code: string;
    message: string;
}
