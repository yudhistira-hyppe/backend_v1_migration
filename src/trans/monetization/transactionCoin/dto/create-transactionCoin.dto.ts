export class CreateTransactionCoinDto {
    readonly _id: { oid: String; };
    idPackage: { oid: String; };
    idUser: { oid: String; };
    idTransaction: { oid: String; };
    qty: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}