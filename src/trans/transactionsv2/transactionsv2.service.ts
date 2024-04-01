import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { transactionsV2, transactionsV2Document } from './schema/transactionsv2.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { ProductsService } from './products/products.service';
import { TransactionsCategorysService } from './categorys/transactionscategorys.service';
import { TransactionsCategorys } from './categorys/schema/transactionscategorys.schema';

@Injectable()
export class TransactionsV2Service {
    constructor(

        @InjectModel(transactionsV2.name, 'SERVER_FULL')
        private readonly transactionsModel: Model<transactionsV2Document>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService, 
        private readonly userbasicnewService: UserbasicnewService, 
        private readonly productsService: ProductsService, 
        private readonly transactionsCategorysService: TransactionsCategorysService,
    ) { }

    async insertTransaction(platform: string, categoryProduct: string, coin: number, idUser: string, idVoucher: string, discountCoin: number = 0, detail: any[]) {
        //Get User Hyppe
        const ID_USER_HYPPE = this.configService.get("ID_USER_HYPPE");
        const GET_ID_USER_HYPPE = await this.utilsService.getSetting_Mixed(ID_USER_HYPPE);
        const getDataUserHyppe = await this.userbasicnewService.findOne(GET_ID_USER_HYPPE.toString());
        if (!(await this.utilsService.ceckData(getDataUserHyppe))){
            return null;
        }

        //Get User
        const getDataUser = await this.userbasicnewService.findOne(idUser.toString());
        if (!(await this.utilsService.ceckData(getDataUser))) {
            return null;
        }

        //Get Product
        const getProduct = await this.productsService.findOneByCode(categoryProduct.toString());
        if (!(await this.utilsService.ceckData(getProduct))) {
            return null;
        }
        const productName = getProduct.name.toString();
        
        //Get Transaction Category
        const getCategoryTransaction = await this.transactionsCategorysService.findByType(productName.toString());
        if (!(await this.utilsService.ceckData(getCategoryTransaction))) {
            return null;
        } else {
            if (getCategoryTransaction.length < 1) {
                return null;
            }
        }

        //Get Transaction Count
        let TransactionCount = 0;
        try {
            const getTransactionCount = await this.transactionsModel.distinct("idTransaction");
            TransactionCount = getTransactionCount.length;
        } catch(e){
            return null;
        }

        const currentDate = await this.utilsService.getDateTimeString();
        const idTransaction = await this.generateIdTransaction();

        //Insert Transaction
        for (let cat = 0; cat < getCategoryTransaction.length;cat++){
            let categoryTransaction = getCategoryTransaction[cat];
            let generateInvoice = await this.generateInvoice(platform, categoryTransaction.code, categoryProduct, TransactionCount);
            let transactionsV2_ = new transactionsV2();
            transactionsV2_._id = new mongoose.Types.ObjectId();
            transactionsV2_.type = categoryTransaction.user;
            transactionsV2_.idTransaction = idTransaction;
            transactionsV2_.noInvoice = generateInvoice;
            transactionsV2_.createdAt = currentDate;
            transactionsV2_.updatedAt = currentDate;
            transactionsV2_.category = categoryTransaction._id;
            if (idVoucher!=undefined){
                transactionsV2_.voucherDiskon = new mongoose.Types.ObjectId(idVoucher); 
            }
            transactionsV2_.coinDiscount = discountCoin;
            transactionsV2_.coin = coin;
            transactionsV2_.totalCoin = coin - discountCoin;
            if (categoryTransaction.user =="HYPPE"){
                transactionsV2_.idUser = getDataUserHyppe._id;
            }
            if (categoryTransaction.user == "USER") {
                transactionsV2_.idUser = getDataUser._id;
            }
            transactionsV2_.status = "PENDING";
            transactionsV2_.detail = detail;
        }
    }

    async generateInvoice(Platform: string, categoryProduct: string, codeProduct: string, No: number) {
        let TransactionInvoice = "";

        //Year Code
        const CurrentDate = new Date();
        const Year = CurrentDate.getFullYear();

        //Platform Code
        let PlatformCode = "UNKNOWN";
        if (Platform == "App") {
            PlatformCode = "APP";
        } else if (Platform == "Business") {
            PlatformCode = "BUS";
        } else if (Platform == "Console") {
            PlatformCode = "CON";
        } else {
            PlatformCode = "UNKNOWN";
        }

        //Transaction Code
        let TransactionNumber = "UNKNOWN"
        if ((No.toString().length) == 6) {
            TransactionNumber += No.toString();
        } else if ((No.toString().length) == 5) {
            TransactionNumber += "0" + No.toString();
        } else if ((No.toString().length) == 4) {
            TransactionNumber += "00" + No.toString();
        } else if ((No.toString().length) == 3) {
            TransactionNumber += "000" + No.toString();
        } else if ((No.toString().length) == 2) {
            TransactionNumber += "0000" + No.toString();
        } else if ((No.toString().length) == 1) {
            TransactionNumber += "00000" + No.toString();
        }

        TransactionInvoice += Year.toString() + "/" + PlatformCode + "/" + categoryProduct + "/" + codeProduct + "/" + TransactionNumber; 
        return TransactionInvoice;
    }

    async generateIdTransaction(){
        let IdTransaction = "";

        //Date Code
        const CurrentDate = new Date();
        const Year = CurrentDate.getFullYear();
        const Month = (CurrentDate.getMonth() < 10 ? '0' + CurrentDate.getMonth().toString() : CurrentDate.getMonth().toString());
        const Day = (CurrentDate.getDate() < 10 ? '0' + CurrentDate.getDate().toString() : CurrentDate.getDate().toString());
        const Time = CurrentDate.getTime().toString();
        IdTransaction = Year + "/" + Month + "/" + Day + "/" + Time;
        return IdTransaction;
    }
}
