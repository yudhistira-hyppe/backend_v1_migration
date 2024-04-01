export class CreateUserbankaccountsDto {
    readonly _id: { oid: string; };
    idBank: { oid: String; };
    userId: { oid: String; };
    noRek: string;
    nama: string;
    statusInquiry: boolean;
    description: string;
    active: boolean;
    userHandle: any[];
    mediaSupportType: String;
    mediaSupportBasePath: String;
    mediaSupportUri: any[];
    SupportOriginalName: any[];
    SupportfsSourceUri: any[];
    SupportfsSourceName: any[];
    SupportfsTargetUri: any[];
    SupportmediaMime: String;
    createdAt: string;
    updatedAt: string;
    SupportUploadSource: string
    similarity: number
}