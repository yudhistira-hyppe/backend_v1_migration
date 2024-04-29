import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { transactionsV2, transactionsV2Document } from './schema/transactionsv2.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { TransactionsCategorysService } from './categorys/transactionscategorys.service';
import { Balanceds } from './balanceds/schema/balanceds.schema';
import { BalancedsService } from './balanceds/balanceds.service';
import { transactionCoin } from '../monetization/transactionCoin/schemas/transactionCoin.schema';
import { Userbasicnew } from '../userbasicnew/schemas/userbasicnew.schema';

@Injectable()
export class TransactionsV2Service {
    constructor(

        @InjectModel(transactionsV2.name, 'SERVER_FULL')
        private readonly transactionsModel: Model<transactionsV2Document>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService, 
        private readonly userbasicnewService: UserbasicnewService, 
        private readonly transactionsProductsService: TransactionsProductsService, 
        private readonly transactionsCategorysService: TransactionsCategorysService,
        private readonly balancedsService: BalancedsService,
    ) { }

    async insertTransaction(platform: string, transactionProductCode: string, coin: number, idUserBuy: string, idUserSell: string, idVoucher: any[], discountCoin: number = 0, detail: any[], status: string) {
        //Get User Hyppe
        const ID_USER_HYPPE = this.configService.get("ID_USER_HYPPE");
        const GET_ID_USER_HYPPE = await this.utilsService.getSetting_Mixed(ID_USER_HYPPE);
        const getDataUserHyppe = await this.userbasicnewService.findOne(GET_ID_USER_HYPPE.toString());
        if (!(await this.utilsService.ceckData(getDataUserHyppe))){
            return null;
        }

        //Get User Buy
        let getDataUserBuy: Userbasicnew=null;
        if (idUserBuy != undefined) {
            getDataUserBuy = await this.userbasicnewService.findOne(idUserBuy.toString());
            if (!(await this.utilsService.ceckData(getDataUserBuy))) {
                return null;
            }

        }

        //Get User Sell
        let getDataUserSell: Userbasicnew = null;
        if (transactionProductCode == "CM" || transactionProductCode == "GF" || transactionProductCode == "AD") {
            if (idUserSell != undefined) {
                getDataUserSell = await this.userbasicnewService.findOne(idUserSell.toString());
                if (!(await this.utilsService.ceckData(getDataUserSell))) {
                    return null;
                }
            }
        }

        //Get Product
        const getProduct = await this.transactionsProductsService.findOneByCode(transactionProductCode.toString());
        if (!(await this.utilsService.ceckData(getProduct))) {
            return null;
        }
        
        //Get Transaction Category
        const getCategoryTransaction = await this.transactionsCategorysService.findByProduct(getProduct._id.toString());
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

        //Looping Category
        let user = 1;
        for (let cat = 0; cat < getCategoryTransaction.length;cat++){
            //Generate Invoice Number
            let categoryTransaction = getCategoryTransaction[cat];
            let generateInvoice = await this.generateInvoice(platform, categoryTransaction.code, transactionProductCode, TransactionCount);
            let transactionsV2_ = new transactionsV2();
            let transactionsV2_id = new mongoose.Types.ObjectId();
            transactionsV2_._id = transactionsV2_id;
            transactionsV2_.type = categoryTransaction.user;
            transactionsV2_.idTransaction = idTransaction;
            transactionsV2_.noInvoice = generateInvoice;
            transactionsV2_.createdAt = currentDate;
            transactionsV2_.updatedAt = currentDate;
            transactionsV2_.category = categoryTransaction._id;
            if (idVoucher!=undefined){
                let dataIdVoucher = [];
                if (idVoucher.length>0){
                    for (let voc = 0; voc < idVoucher.length;voc++){
                        dataIdVoucher.push(new mongoose.Types.ObjectId(idVoucher[voc]))
                    }
                }
                transactionsV2_.voucherDiskon = dataIdVoucher;
            }
            transactionsV2_.coinDiscount = discountCoin;
            transactionsV2_.coin = coin;
            transactionsV2_.totalCoin = coin - discountCoin;
            if (categoryTransaction.user =="HYPPE"){
                transactionsV2_.idUser = getDataUserHyppe._id;
            }

            if (categoryTransaction.transaction != undefined) {
                if (categoryTransaction.transaction.length > 0) {
                    let dataCateGoryTransaction = categoryTransaction.transaction;
                    for (let t = 0; t < dataCateGoryTransaction.length; t++) {
                        //Get Transaction name, Transaction Category
                        let nameCategoryTransaction = "";
                        if (dataCateGoryTransaction[t].name!=undefined){
                            nameCategoryTransaction = dataCateGoryTransaction[t].name
                        }
                        //Get Transaction status, Transaction Category
                        let statusCategoryTransaction = "";
                        if (dataCateGoryTransaction[t].statu != undefined) {
                            statusCategoryTransaction = dataCateGoryTransaction[t].statu
                        }

                        //Get Transaction, Transaction Category
                        if (statusCategoryTransaction != "") {
                            if (dataCateGoryTransaction[t].statu.toString().toLowerCase() == "debet") {
                                transactionsV2_.idUser = getDataUserSell._id;
                            }
                            if (dataCateGoryTransaction[t].statu.toString().toLowerCase() == "kredit") {
                                transactionsV2_.idUser = getDataUserBuy._id;
                            }
                        }

                        //Get Transaction, Transaction Category
                        if (nameCategoryTransaction != "") {
                            //Get Coa
                            //findOneBySubCoaName
                            if (dataCateGoryTransaction[t].statu.toString().toLowerCase() == "debet") {
                                transactionsV2_.idUser = getDataUserSell._id;
                            }
                            if (dataCateGoryTransaction[t].statu.toString().toLowerCase() == "kredit") {
                                transactionsV2_.idUser = getDataUserBuy._id;
                            }
                        }
                    }
                }
            }
            
            if (categoryTransaction.user == "USER") {
                if (categoryTransaction.code == "PNC") {
                    transactionsV2_.idUser = getDataUserSell._id;
                } else {
                    transactionsV2_.idUser = getDataUserBuy._id;
                }
            }

            transactionsV2_.status = status;
            transactionsV2_.detail = detail;
            await this.transactionsModel.create(transactionsV2_);

            //Insert Balanceds
            let Balanceds_ = new Balanceds();
            Balanceds_._id = new mongoose.Types.ObjectId();
            Balanceds_.idTransaction = transactionsV2_id;
            if (categoryTransaction.user == "HYPPE") {
                Balanceds_.user = getDataUserHyppe._id;
                Balanceds_.debet = 0;
                Balanceds_.kredit = 0;
                Balanceds_.saldo = 0;
            }
            if (categoryTransaction.user == "USER") {
                if (categoryTransaction.code == "PNC") {
                    Balanceds_.user = getDataUserSell._id;
                    Balanceds_.debet = 0;
                    Balanceds_.kredit = 0;
                    Balanceds_.saldo = 0;
                } else {
                    Balanceds_.user = getDataUserBuy._id;
                    Balanceds_.debet = 0;
                    Balanceds_.kredit = 0;
                    Balanceds_.saldo = 0;
                }
            }
            Balanceds_.noInvoice = generateInvoice;
            Balanceds_.createdAt = currentDate;
            Balanceds_.updatedAt = currentDate;
            Balanceds_.userType = categoryTransaction.user;
            Balanceds_.coa = [];
            Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
            await this.balancedsService.create(Balanceds_);
            user
        }
    }

    async insertTransaction_(platform: string, transactionProductCode: string, coin: number, idUserBuy: string, idUserSell: string, idVoucher: any[], discountCoin: number = 0, detail: any[], status: string) {
        //Get User Hyppe
        const ID_USER_HYPPE = this.configService.get("ID_USER_HYPPE");
        const GET_ID_USER_HYPPE = await this.utilsService.getSetting_Mixed(ID_USER_HYPPE);
        const getDataUserHyppe = await this.userbasicnewService.findOne(GET_ID_USER_HYPPE.toString());
        if (!(await this.utilsService.ceckData(getDataUserHyppe))) {
            return null;
        }

        //Get User Buy
        let getDataUserBuy: Userbasicnew = null;
        if (idUserBuy != undefined) {
            getDataUserBuy = await this.userbasicnewService.findOne(idUserBuy.toString());
            if (!(await this.utilsService.ceckData(getDataUserBuy))) {
                return null;
            }

        }

        //Get User Sell
        let getDataUserSell: Userbasicnew = null;
        if (transactionProductCode == "CM" || transactionProductCode == "GF" || transactionProductCode == "AD") {
            if (idUserSell != undefined) {
                getDataUserSell = await this.userbasicnewService.findOne(idUserSell.toString());
                if (!(await this.utilsService.ceckData(getDataUserSell))) {
                    return null;
                }
            }
        }

        //Get Product
        const getProduct = await this.transactionsProductsService.findOneByCode(transactionProductCode.toString());
        if (!(await this.utilsService.ceckData(getProduct))) {
            return null;
        }

        //Get Transaction Category
        const getCategoryTransaction = await this.transactionsCategorysService.findByProduct(getProduct._id.toString());
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
        } catch (e) {
            return null;
        }

        const currentDate = await this.utilsService.getDateTimeString();
        const idTransaction = await this.generateIdTransaction();

        //Insert Transaction
        for (let cat = 0; cat < getCategoryTransaction.length; cat++) {
            let categoryTransaction = getCategoryTransaction[cat];
            let generateInvoice = await this.generateInvoice(platform, categoryTransaction.code, transactionProductCode, TransactionCount);
            let transactionsV2_ = new transactionsV2();
            let transactionsV2_id = new mongoose.Types.ObjectId();
            transactionsV2_._id = transactionsV2_id;
            transactionsV2_.type = categoryTransaction.user;
            transactionsV2_.idTransaction = idTransaction;
            transactionsV2_.noInvoice = generateInvoice;
            transactionsV2_.createdAt = currentDate;
            transactionsV2_.updatedAt = currentDate;
            transactionsV2_.category = categoryTransaction._id;
            if (idVoucher != undefined) {
                let dataIdVoucher = [];
                if (idVoucher.length > 0) {
                    for (let voc = 0; voc < idVoucher.length; voc++) {
                        dataIdVoucher.push(new mongoose.Types.ObjectId(idVoucher[voc]))
                    }
                }
                transactionsV2_.voucherDiskon = dataIdVoucher;
            }
            transactionsV2_.coinDiscount = discountCoin;
            transactionsV2_.coin = coin;
            transactionsV2_.totalCoin = coin - discountCoin;
            if (categoryTransaction.user == "HYPPE") {
                transactionsV2_.idUser = getDataUserHyppe._id;
            }
            if (categoryTransaction.user == "USER") {
                if (categoryTransaction.code == "PNC") {
                    transactionsV2_.idUser = getDataUserSell._id;
                } else {
                    transactionsV2_.idUser = getDataUserBuy._id;
                }
            }

            transactionsV2_.status = status;
            transactionsV2_.detail = detail;
            await this.transactionsModel.create(transactionsV2_);

            //Insert Balanceds
            let Balanceds_ = new Balanceds();
            Balanceds_._id = new mongoose.Types.ObjectId();
            Balanceds_.idTransaction = transactionsV2_id;
            let Saldo = 0;
            if (categoryTransaction.user == "HYPPE") {
                Balanceds_.user = getDataUserHyppe._id;
                let balanceUser = await this.balancedsService.findByuser(getDataUserHyppe._id.toString());
                if (await this.utilsService.ceckData(balanceUser)){
                    Saldo = balanceUser.saldo;
                }
                Balanceds_.debet = 0;
                Balanceds_.kredit = 0;
                Balanceds_.saldo = 0;
            }
            if (categoryTransaction.user == "USER") {
                if (categoryTransaction.code == "PNC") {
                    Balanceds_.user = getDataUserSell._id;
                    let balanceUser = await this.balancedsService.findByuser(getDataUserSell._id.toString());
                    if (await this.utilsService.ceckData(balanceUser)) {
                        Saldo = balanceUser.saldo;
                    }
                    Balanceds_.debet = 0;
                    Balanceds_.kredit = 0;
                    Balanceds_.saldo = 0;
                } else {
                    let balanceUser = await this.balancedsService.findByuser(getDataUserBuy._id.toString());
                    if (await this.utilsService.ceckData(balanceUser)) {
                        Saldo = balanceUser.saldo;
                    }
                    Balanceds_.user = getDataUserBuy._id;
                    Balanceds_.debet = 0;
                    Balanceds_.kredit = 0;
                    Balanceds_.saldo = 0;
                }
            }
            Balanceds_.noInvoice = generateInvoice;
            Balanceds_.createdAt = currentDate;
            Balanceds_.updatedAt = currentDate;
            Balanceds_.userType = categoryTransaction.user;
            Balanceds_.coa = [];
            Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
            await this.balancedsService.create(Balanceds_);
        }
    }

    async generateInvoice(Platform: string, categoryTransaction: string, codeProduct: string, No: number) {
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

        TransactionInvoice += Year.toString() + "/" + PlatformCode + "/" + categoryTransaction + "/" + codeProduct + "/" + TransactionNumber; 
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
