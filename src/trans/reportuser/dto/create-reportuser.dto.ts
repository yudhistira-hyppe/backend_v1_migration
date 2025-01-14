export class CreateReportsuserDto {
    readonly _id: { oid: String; };
    createdAt: string;
    updatedAt: string;
    remark: string;
    type: string;
    removedReasonId: { oid: String; };
    reportTypeId: string;
    updatedBy: { oid: String; };
    isRemoved: boolean;
    detailReport: any[];
}

export class DetailReport {
    userId: { oid: String; };
    reportReasonId: { oid: String; };
    createdAt: string;
}