export class CreateBanksDto {


    readonly _id: { oid: String; };
    readonly bankcode: string;
    readonly bankname: string;
    // readonly bankIcon: string;
    bankIcon: string;
    readonly urlEbanking: string;
    readonly atm: string;
    readonly internetBanking: string;
    readonly mobileBanking: string;
    isActive : boolean;
    cekDigit: boolean
    jmlDigit: number


}