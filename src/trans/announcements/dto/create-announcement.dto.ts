export class CreateAnnouncementsDto {


    // readonly _id: { oid:string;  };
    title: string;
    body: string;
    datetimeCreate: string;
    datetimeSend: string;
    pushMessage: boolean;
    appMessage: boolean;
    appInfo: boolean;
    email: boolean;
    idusershare: { oid: String; };
    status: string;
    tipe: string;
    Detail: any[];


}

export class UserDto {


    iduser: { oid: String; };

}