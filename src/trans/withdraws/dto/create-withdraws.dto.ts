export class CreateWithdrawsDto {
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
    tracking?: any[];
}

export class OyDisburseCallbackWithdraw {

    status: StatusWithdraw;
    tx_status_description?: string;
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
export class StatusWithdraw {
    code: string;
    message: string;
}