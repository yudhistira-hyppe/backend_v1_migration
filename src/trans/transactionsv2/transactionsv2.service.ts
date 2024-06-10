import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { transactionsV2, transactionsV2Document } from './schema/transactionsv2.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { TransactionsCategorysService } from './categorys/transactionscategorys.service';
import { TransactionsBalanceds } from './balanceds/schema/transactionsbalanceds.schema';
import { TransactionsBalancedsService } from './balanceds/transactionsbalanceds.service';
import { Userbasicnew } from '../userbasicnew/schemas/userbasicnew.schema';
import { AdsBalaceCredit } from '../adsv2/adsbalacecredit/schema/adsbalacecredit.schema';
import { TransactionsCoinSettingsService } from './coin/transactionscoinsettings.service';
import { AdsPriceCreditsService } from '../adsv2/adspricecredits/adspricecredits.service';
import { TransactionsCoa } from './coa/schema/transactionscoa.schema';
import { TransactionsCoaService } from './coa/transactionscoa.service';
import { TransactionsCoaTable } from './coa/schema/transactionscoatable.schema';
import { TransactionsCoaTableService } from './coa/transactionscoatable.service';
import { AdsBalaceCreditService } from '../adsv2/adsbalacecredit/adsbalacecredit.service';
import { DisquslogsService } from '../../content/disquslogs/disquslogs.service';
import { AdsService } from '../ads/ads.service';

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
        private readonly transactionsBalancedsService: TransactionsBalancedsService,
        private readonly adsBalaceCreditService: AdsBalaceCreditService,
        private readonly transactionsCoinSettingsService: TransactionsCoinSettingsService,
        private readonly adsPriceCreditsService: AdsPriceCreditsService,
        private readonly transactionsCoaService: TransactionsCoaService,
        private readonly transactionsCoaTableService: TransactionsCoaTableService,
        private readonly disquslogsService: DisquslogsService,
        private readonly adsService: AdsService,
    ) { }

    async updateByIdTransaction(idTrans: string, data: any) {
        return this.transactionsModel.updateMany(
            { idTransaction: idTrans },
            data
        ).exec();
    }

    async findByOne(iduser: string, postid: string): Promise<transactionsV2> {
        return this.transactionsModel.findOne({
            "type": "USER",
            "idUser": new mongoose.Types.ObjectId(iduser),
            'detail.postID': postid
        }).exec();
    }

    async findOneByIdTransAndType(idTrans: string, type: string): Promise<transactionsV2> {
        return this.transactionsModel.findOne({
            idTransaction: idTrans,
            type: type
        }).exec()
    }

    async findByOneCredit(iduser: string, paketID: string): Promise<transactionsV2> {
        return this.transactionsModel.findOne({
            "type": "USER",
            "idUser": new mongoose.Types.ObjectId(iduser), 'detail.typeData': "CREDIT",
            'detail.paketID': paketID
        }).exec();
    }

    async findByOneNova(iduser: string, nova: string): Promise<transactionsV2> {
        return this.transactionsModel.findOne({
            "type": "USER",
            "idUser": new mongoose.Types.ObjectId(iduser),
            'detail.payload.va_number': nova
        }).exec();
    }

    async updateTransaction(idTrans: string, status: string, data: any) {
        //Get Current Date
        const currentDate = await this.utilsService.getDateTimeString();
        //Get Data Transaction
        const getDataTransaction = await this.transactionsModel.find({ idTransaction: idTrans }).exec();

        //Currency coin 
        const currencyCoin = (await this.transactionsCoinSettingsService.findStatusActive()).price;
        const currencyCoinId = (await this.transactionsCoinSettingsService.findStatusActive())._id;

        //Product Id
        let productId = null;


        let cost_verification = 0;
        const ID_SETTING_COST_BANK_VERIFICATION = this.configService.get("ID_SETTING_COST_BANK_VERIFICATION");
        const GET_ID_SETTING_COST_BANK_VERIFICATION = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_COST_BANK_VERIFICATION);
        if (await this.utilsService.ceckData(GET_ID_SETTING_COST_BANK_VERIFICATION)) {
            cost_verification = Number(GET_ID_SETTING_COST_BANK_VERIFICATION.value);
        }

        //Get Biaya verifikasi OY
        let cost_verification_oy = 0;
        const ID_SETTING_COST_BANK_VERIFICATION_OY = this.configService.get("ID_SETTING_COST_BANK_VERIFICATION_OY");
        const GET_ID_SETTING_COST_BANK_VERIFICATION_OY = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_COST_BANK_VERIFICATION_OY);
        if (await this.utilsService.ceckData(GET_ID_SETTING_COST_BANK_VERIFICATION_OY)) {
            cost_verification_oy = Number(GET_ID_SETTING_COST_BANK_VERIFICATION_OY.value);
        }

        //Get Coin
        let coin = 0;

        //Type Category
        let typeCategory = null;

        //User Id
        let idUser = null;

        //User Hyppe
        let idHyppe = null;

        if (getDataTransaction.length > 0) {
            for (let uh = 0; uh < getDataTransaction.length; uh++) {
                let debet = 0;
                let kredit = 0;
                let saldo = 0;
                let insertBalanced = false;

                let dataTransaction = getDataTransaction[uh];
                productId = dataTransaction.product;
                typeCategory = dataTransaction.typeCategory;
                const categoryTransaction = await this.transactionsCategorysService.findOne(dataTransaction.category.toString());
                if (dataTransaction.type == "USER") {
                    idUser = dataTransaction.idUser;
                    coin = dataTransaction.coin;
                    if (categoryTransaction.type != undefined) {
                        if (categoryTransaction.type.length > 0) {
                            for (let j = 0; j < categoryTransaction.type.length; j++) {
                                let transactionTypeCategory = categoryTransaction.type[j].category;
                                if (transactionTypeCategory == "END") {
                                    if (dataTransaction.detail != undefined) {
                                        if (dataTransaction.detail.length > 0) {
                                            if (dataTransaction.detail[0].adsID != undefined) {
                                                let idAds = dataTransaction.detail[0].adsID.toString();
                                                const adsService_ = await this.adsService.findOne(idAds);
                                                if (await this.utilsService.ceckData(adsService_)) {
                                                    let AdsBalaceCredit_ = new AdsBalaceCredit();
                                                    AdsBalaceCredit_._id = new mongoose.Types.ObjectId();
                                                    AdsBalaceCredit_.iduser = new mongoose.Types.ObjectId(dataTransaction.idUser.toString());
                                                    AdsBalaceCredit_.debet = Number(dataTransaction.credit);
                                                    AdsBalaceCredit_.kredit = 0;
                                                    AdsBalaceCredit_.type = "REFUND";
                                                    AdsBalaceCredit_.idtrans = dataTransaction._id;
                                                    AdsBalaceCredit_.timestamp = await this.utilsService.getDateTimeString();
                                                    AdsBalaceCredit_.description = "ADS REJECTED";
                                                    AdsBalaceCredit_.idAdspricecredits = adsService_.idAdspricecredits;
                                                    await this.adsBalaceCreditService.create(AdsBalaceCredit_);
                                                }
                                            }
                                        }
                                    }
                                }
                                if (transactionTypeCategory == "BUY") {
                                    if (categoryTransaction.type[j].transaction != undefined) {
                                        let transactionTypetransaction = categoryTransaction.type[j].transaction;
                                        for (let tr = 0; tr < transactionTypetransaction.length; tr++) {
                                            if (transactionTypetransaction[tr].name != undefined) {
                                                if (transactionTypetransaction[tr].name == "BalacedCoin") {
                                                    if (transactionTypetransaction[tr].status != undefined) {
                                                        if (transactionTypetransaction[tr].status == "debit") {
                                                            if (status == "SUCCESS") {
                                                                debet = dataTransaction.coin;
                                                                kredit = 0;
                                                                insertBalanced = true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (dataTransaction.type == "HYPPE") {
                    // let kas = 0;
                    // let biayaPaymentGateway = 0;
                    // let hutangSaldoCoin = 0;
                    // let pendapatanBiayaTransaction = 0;
                    // let pendapatanPenukaranCoin = 0;
                    idHyppe = dataTransaction.idUser;
                    if (categoryTransaction.type != undefined) {
                        if (categoryTransaction.type.length > 0) {
                            for (let j = 0; j < categoryTransaction.type.length; j++) {
                                let transactionTypeCategory = categoryTransaction.type[j].category;

                                let TransactionsCoaTable_Filter = new TransactionsCoaTable();
                                let TransactionsCoaTable_Update = new TransactionsCoaTable();

                                let TransactionsCoa_Filter = new TransactionsCoa();
                                let TransactionsCoa_Update = new TransactionsCoa();
                                if (transactionTypeCategory == "BUY") {
                                    TransactionsCoaTable_Filter.idTransaction = dataTransaction.idTransaction;
                                    TransactionsCoaTable_Update.status = status;
                                    await this.transactionsCoaTableService.updateData(TransactionsCoaTable_Filter, TransactionsCoaTable_Update);

                                    TransactionsCoa_Filter.idTransaction = dataTransaction.idTransaction;
                                    TransactionsCoa_Update.status = status;
                                    await this.transactionsCoaService.updateData(TransactionsCoa_Filter, TransactionsCoa_Update);
                                }
                                if (transactionTypeCategory == "WD") {
                                    TransactionsCoaTable_Filter.idTransaction = dataTransaction.idTransaction;
                                    TransactionsCoaTable_Update.status = status;
                                    await this.transactionsCoaTableService.updateData(TransactionsCoaTable_Filter, TransactionsCoaTable_Update);

                                    TransactionsCoa_Filter.idTransaction = dataTransaction.idTransaction;
                                    TransactionsCoa_Update.status = status;
                                    await this.transactionsCoaService.updateData(TransactionsCoa_Filter, TransactionsCoa_Update);
                                }
                            }
                        }
                    }
                }

                if (insertBalanced) {
                    //Get Saldo
                    let balancedUser = await this.transactionsBalancedsService.findsaldo(dataTransaction.idUser.toString());
                    if (await this.utilsService.ceckData(balancedUser)) {
                        if (balancedUser.length > 0) {
                            saldo = balancedUser[0].totalSaldo;
                        }
                    }

                    //Insert Balanceds
                    let Balanceds_ = new TransactionsBalanceds();
                    Balanceds_._id = new mongoose.Types.ObjectId();
                    Balanceds_.idTransaction = new mongoose.Types.ObjectId(dataTransaction._id.toString());
                    Balanceds_.idUser = dataTransaction.idUser;
                    Balanceds_.debit = debet;
                    Balanceds_.credit = kredit;
                    Balanceds_.saldo = saldo - kredit + debet;
                    Balanceds_.noInvoice = dataTransaction.noInvoice;
                    Balanceds_.createdAt = currentDate;
                    Balanceds_.updatedAt = currentDate;
                    Balanceds_.userType = categoryTransaction.user;
                    Balanceds_.coa = [];
                    Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
                    await this.transactionsBalancedsService.create(Balanceds_);
                }

                let dataDetail = dataTransaction.detail;
                if (data != null) {
                    dataDetail.push(data)
                }
                let transactionsV2_ = new transactionsV2();
                transactionsV2_.status = status;
                transactionsV2_.detail = dataDetail;
                await this.transactionsModel.findByIdAndUpdate(dataTransaction._id.toString(), transactionsV2_, { new: true });
            }
        }

        if (typeCategory == "WD") {
            if (status == "FAILED") {
                //Get Transaction Count
                let TransactionCount = 1;
                try {
                    const getTransactionCount = await this.transactionsModel.distinct("idTransaction");
                    TransactionCount += getTransactionCount.length;
                } catch (e) {
                    return false;
                }

                //Generate Id Transaction
                const idTransaction = await this.generateIdTransaction();

                //if (productId != null && idTransaction != null) {
                if (productId != null) {
                    const getCategoryTransaction = await this.transactionsCategorysService.findByProduct(productId.toString(), "REFUND");
                    if (getCategoryTransaction.length > 0) {
                        for (let cat = 1; cat <= getCategoryTransaction.length; cat++) {
                            let categoryTransaction = getCategoryTransaction[cat - 1];

                            //For Balanced
                            let idUser_ = null;
                            let typeUser = "";

                            let saldo = 0;
                            let debet = 0;
                            let kredit = 0;
                            let insertBalanced = false;

                            //Generate Invoice Number
                            let generateInvoice = await this.generateInvoice("APP", categoryTransaction.code, "CN", TransactionCount);

                            //Insert Transaction
                            let transactionsV2_ = new transactionsV2();
                            let transactionsV2_id = new mongoose.Types.ObjectId();
                            transactionsV2_._id = transactionsV2_id;
                            transactionsV2_.type = categoryTransaction.user;
                            transactionsV2_.idTransaction = idTransaction;
                            transactionsV2_.noInvoice = generateInvoice;
                            transactionsV2_.createdAt = currentDate;
                            transactionsV2_.updatedAt = currentDate;
                            transactionsV2_.category = categoryTransaction._id;
                            transactionsV2_.product = productId;
                            transactionsV2_.status = "SUCCESS";
                            transactionsV2_.detail = [data];

                            if (categoryTransaction.user == "HYPPE") {
                                typeUser = "USER_HYPPE";
                                idUser_ = idHyppe;
                                insertBalanced = false;
                                transactionsV2_.coin = 0;
                                transactionsV2_.totalCoin = 0;

                                let kas = 0;
                                let biayaPaymentGateway = 0;
                                let biayaDiscount = 0;
                                let biayaFreeCreator = 0;

                                let hutangSaldoCoin = 0;
                                let hutangSaldoCredit = 0;

                                let pendapatanBiayaTransaction = 0;
                                let pendapatanPenukaranCoin = 0;
                                let pendapatanContentOwnership = 0;
                                let pendapatanContentMarketPlace = 0;
                                let pendapatanBoostPost = 0;
                                let pendapatanLiveGift = 0;
                                let pendapatanContentGift = 0;
                                let pendapatanAdvertisement = 0;
                                let pendapatanDiTarik = 0;

                                let modalDiSetor = 0;
                                let allProductPendapatan = 0;

                                if (categoryTransaction.type != undefined) {
                                    if (categoryTransaction.type.length > 0) {
                                        for (let uh = 0; uh < categoryTransaction.type.length; uh++) {
                                            let categoryTransactionType = categoryTransaction.type[uh];
                                            if (productId.toString() == categoryTransactionType.idProduct.toString()) {
                                                if (categoryTransactionType.transaction != undefined) {
                                                    if (categoryTransactionType.transaction.length > 0) {
                                                        let transactionTypetransaction = categoryTransactionType.transaction;
                                                        for (let tr = 0; tr < categoryTransactionType.transaction.length; tr++) {
                                                            if (transactionTypetransaction[tr].name != undefined) {
                                                                if (transactionTypetransaction[tr].name == "Kas") {
                                                                    if (transactionTypetransaction[tr].status != undefined) {
                                                                        if (transactionTypetransaction[tr].status == "credit") {
                                                                            kas = cost_verification - cost_verification_oy;
                                                                        }
                                                                    }
                                                                }
                                                                if (transactionTypetransaction[tr].name == "BiayaPG") {
                                                                    if (transactionTypetransaction[tr].status != undefined) {
                                                                        if (transactionTypetransaction[tr].status == "debit") {
                                                                            biayaPaymentGateway = cost_verification_oy;
                                                                        }
                                                                    }
                                                                }
                                                                if (transactionTypetransaction[tr].name == "HutangCoin") {
                                                                    if (transactionTypetransaction[tr].status != undefined) {
                                                                        if (transactionTypetransaction[tr].status == "debit") {
                                                                            hutangSaldoCoin = (Number(currencyCoin) * (coin)) - cost_verification;
                                                                        }
                                                                    }
                                                                }
                                                                if (transactionTypetransaction[tr].name == "PendapatanBiayaTransaksi") {
                                                                    if (transactionTypetransaction[tr].status != undefined) {
                                                                        if (transactionTypetransaction[tr].status == "debit") {
                                                                            pendapatanBiayaTransaction = cost_verification;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                //Insert Coa Table
                                let TransactionsCoa_ = new TransactionsCoa();
                                TransactionsCoa_._id = new mongoose.Types.ObjectId();
                                TransactionsCoa_.coaTransaction = generateInvoice;
                                TransactionsCoa_.asset = {
                                    kas: kas,
                                    biaya: {
                                        biayaPaymentGateway: biayaPaymentGateway,
                                        biayaDiscount: biayaDiscount,
                                        biayaFreeCreator: biayaFreeCreator
                                    }
                                };
                                TransactionsCoa_.hutang = {
                                    hutangSaldoCoin: hutangSaldoCoin,
                                    hutangSaldoCredit: hutangSaldoCredit
                                };
                                TransactionsCoa_.ekuitas = {
                                    saldoPendapatan: {
                                        pendapatanBiayaTransaction: pendapatanBiayaTransaction,
                                        pendapatanPenukaranCoin: pendapatanPenukaranCoin,
                                        pendapatanContentOwnership: pendapatanContentOwnership,
                                        pendapatanContentMarketPlace: pendapatanContentMarketPlace,
                                        pendapatanBoostPost: pendapatanBoostPost,
                                        pendapatanLiveGift: pendapatanLiveGift,
                                        pendapatanContentGift: pendapatanContentGift,
                                        pendapatanAdvertisement: pendapatanAdvertisement
                                    },
                                    saldoDiTarik: {
                                        pendapatanDiTarik: pendapatanDiTarik
                                    }
                                };
                                TransactionsCoa_.modal = {
                                    modalDiSetor: modalDiSetor
                                }
                                TransactionsCoa_.allProductPendapatan = allProductPendapatan;
                                TransactionsCoa_.idTransaction = idTransaction;
                                TransactionsCoa_.idCoinSettings = currencyCoinId;
                                TransactionsCoa_.createdAt = currentDate;
                                TransactionsCoa_.updatedAt = currentDate;
                                TransactionsCoa_.product = new mongoose.Types.ObjectId(productId.toString());
                                TransactionsCoa_.category = categoryTransaction._id;
                                TransactionsCoa_.status = "SUCCESS";
                                await this.transactionsCoaService.create(TransactionsCoa_);

                                //Insert Coa Table
                                let TransactionsCoaTable_ = new TransactionsCoaTable();
                                TransactionsCoaTable_._id = new mongoose.Types.ObjectId();
                                TransactionsCoaTable_.coaTransaction = generateInvoice;
                                TransactionsCoaTable_.kas = kas;
                                TransactionsCoaTable_.biayaPaymentGateway = biayaPaymentGateway;
                                TransactionsCoaTable_.biayaDiscount = biayaDiscount;
                                TransactionsCoaTable_.biayaFreeCreator = biayaFreeCreator;
                                TransactionsCoaTable_.hutangSaldoCoin = hutangSaldoCoin;
                                TransactionsCoaTable_.hutangSaldoCredit = hutangSaldoCredit;
                                TransactionsCoaTable_.pendapatanBiayaTransaction = pendapatanBiayaTransaction;
                                TransactionsCoaTable_.pendapatanPenukaranCoin = pendapatanPenukaranCoin;
                                TransactionsCoaTable_.pendapatanContentOwnership = pendapatanContentOwnership;
                                TransactionsCoaTable_.pendapatanContentMarketPlace = pendapatanContentMarketPlace;
                                TransactionsCoaTable_.pendapatanBoostPost = pendapatanBoostPost;
                                TransactionsCoaTable_.pendapatanLiveGift = pendapatanLiveGift;
                                TransactionsCoaTable_.pendapatanContentGift = pendapatanContentGift;
                                TransactionsCoaTable_.pendapatanAdvertisement = pendapatanAdvertisement;
                                TransactionsCoaTable_.pendapatanDiTarik = pendapatanDiTarik;
                                TransactionsCoaTable_.modalDiSetor = modalDiSetor;
                                TransactionsCoaTable_.allProductPendapatan = allProductPendapatan;
                                TransactionsCoaTable_.createdAt = currentDate;
                                TransactionsCoaTable_.updatedAt = currentDate;
                                TransactionsCoaTable_.idTransaction = idTransaction;
                                TransactionsCoaTable_.idCoinSettings = currencyCoinId;
                                TransactionsCoaTable_.product = new mongoose.Types.ObjectId(productId.toString());
                                TransactionsCoaTable_.category = categoryTransaction._id;
                                TransactionsCoaTable_.status = "SUCCESS";
                                await this.transactionsCoaTableService.create(TransactionsCoaTable_);
                            }

                            if (categoryTransaction.user == "USER") {
                                typeUser = "USER_BUY";
                                idUser_ = idUser;
                                insertBalanced = true;
                                transactionsV2_.coin = coin;
                                transactionsV2_.totalCoin = coin;

                                if (categoryTransaction.type != undefined) {
                                    if (categoryTransaction.type.length > 0) {
                                        for (let uh = 0; uh < categoryTransaction.type.length; uh++) {
                                            let categoryTransactionType = categoryTransaction.type[uh];
                                            if (productId.toString() == categoryTransactionType.idProduct.toString()) {
                                                if (categoryTransactionType.transaction != undefined) {
                                                    if (categoryTransactionType.transaction.length > 0) {
                                                        for (let tr = 0; tr < categoryTransactionType.transaction.length; tr++) {
                                                            if (categoryTransactionType.transaction[tr].name != undefined) {
                                                                if (categoryTransactionType.transaction[tr].name == "BalacedCoin") {
                                                                    if (categoryTransactionType.transaction[tr].status != undefined) {
                                                                        if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                            let coin_wd_failed = Number(cost_verification) / Number(currencyCoin)
                                                                            debet = coin - coin_wd_failed;
                                                                            kredit = coin_wd_failed;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            transactionsV2_.typeCategory = "REFUND";
                            transactionsV2_.idUser = idUser_;
                            transactionsV2_.coinDiscount = 0;
                            transactionsV2_.priceDiscont = 0;
                            transactionsV2_.price = 0;
                            transactionsV2_.credit = 0;
                            transactionsV2_.totalPrice = 0;
                            transactionsV2_.typeUser = typeUser;
                            await this.transactionsModel.create(transactionsV2_);

                            if (insertBalanced) {
                                //Get Saldo
                                let balancedUser = await this.transactionsBalancedsService.findsaldo(idUser_.toString());
                                if (await this.utilsService.ceckData(balancedUser)) {
                                    if (balancedUser.length > 0) {
                                        saldo = balancedUser[0].totalSaldo;
                                    }
                                }

                                //Insert Balanceds
                                let Balanceds_ = new TransactionsBalanceds();
                                Balanceds_._id = new mongoose.Types.ObjectId();
                                Balanceds_.idTransaction = transactionsV2_id;
                                Balanceds_.idUser = idUser_;
                                Balanceds_.debit = debet;
                                Balanceds_.credit = kredit;
                                Balanceds_.saldo = saldo - kredit + debet;
                                Balanceds_.noInvoice = generateInvoice;
                                Balanceds_.createdAt = currentDate;
                                Balanceds_.updatedAt = currentDate;
                                Balanceds_.userType = categoryTransaction.user;
                                Balanceds_.coa = [];
                                Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
                                await this.transactionsBalancedsService.create(Balanceds_);
                            }

                        }
                    }
                }
            }
        }
    }

    async insertTransaction(
        platform: string,
        transactionProductCode: string,
        category: string,
        coinTransaction: number,
        discountCoin: number = 0,
        priceRp: number = 0,
        discountRp: number = 0,
        idUserBuy: string,
        idUserSell: string,
        idVoucher: any[],
        detail: any[],
        status: string) {
        var outputdatatransaction = [];
        try {
            //Currency coin 
            const currencyCoin = (await this.transactionsCoinSettingsService.findStatusActive()).price;
            const currencyCoinId = (await this.transactionsCoinSettingsService.findStatusActive())._id;

            //Currency Credit 
            const currencyCredit = (await this.adsPriceCreditsService.findStatusActive()).creditPrice;
            const currencyCreditId = (await this.adsPriceCreditsService.findStatusActive())._id;

            //Get User Hyppe
            const ID_USER_HYPPE = this.configService.get("ID_USER_HYPPE");
            const GET_ID_USER_HYPPE = await this.utilsService.getSetting_Mixed(ID_USER_HYPPE);
            const getDataUserHyppe = await this.userbasicnewService.findOne(GET_ID_USER_HYPPE.toString());
            if (!(await this.utilsService.ceckData(getDataUserHyppe))) {
                return false;
            }

            //Get User Buy
            let getDataUserBuy: Userbasicnew = null;
            if (idUserBuy != undefined) {
                getDataUserBuy = await this.userbasicnewService.findOne(idUserBuy.toString());
                if (!(await this.utilsService.ceckData(getDataUserBuy))) {
                    return false;
                }

            }

            //Get User Sell
            let getDataUserSell: Userbasicnew = null;
            if (transactionProductCode == "CM" || transactionProductCode == "GF" || transactionProductCode == "AD") {
                if (idUserSell != undefined) {
                    getDataUserSell = await this.userbasicnewService.findOne(idUserSell.toString());
                    if (!(await this.utilsService.ceckData(getDataUserSell))) {
                        return false;
                    }
                }
            }

            //Get Product
            const getProduct = await this.transactionsProductsService.findOneByCode(transactionProductCode.toString());
            if (!(await this.utilsService.ceckData(getProduct))) {
                return false;
            }

            //Get Transaction Category
            const getCategoryTransaction = await this.transactionsCategorysService.findByProduct(getProduct._id.toString(), category);
            if (!(await this.utilsService.ceckData(getCategoryTransaction))) {
                return false;
            } else {
                if (getCategoryTransaction.length < 1) {
                    return false;
                }
            }

            //Get Transaction Count
            let TransactionCount = 1;
            try {
                const getTransactionCount = await this.transactionsModel.distinct("idTransaction");
                TransactionCount += getTransactionCount.length;
            } catch (e) {
                return false;
            }

            //Get Current Date
            const currentDate = await this.utilsService.getDateTimeString();

            //Generate Id Transaction
            const idTransaction = await this.generateIdTransaction();

            //Looping Category
            for (let cat = 1; cat <= getCategoryTransaction.length; cat++) {
                let categoryTransaction = getCategoryTransaction[cat - 1];

                //For Balanced
                let idUser = null;
                let typeUser = "";
                let coinDiscount = 0;
                let coin = 0;
                let totalCoin = 0;
                let debet = 0;
                let kredit = 0;
                let saldo = 0;
                let coinProfitSharingCM = 0;
                let coinProfitSharingGF = 0;
                let coinProfitSharingPenukaranCoin = 0;
                let credit = 0;

                let priceDiscont = 0;
                let price = 0;
                let totalPrice = 0;

                if (priceRp != undefined) {
                    price = priceRp;
                }

                if (priceRp != undefined) {
                    priceDiscont = discountRp;
                }
                totalPrice = priceRp - priceDiscont;

                //Get Id Seeting Profit Setting
                if (transactionProductCode == "CM") {
                    const ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE = this.configService.get("ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE");
                    const GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE);
                    if (await this.utilsService.ceckData(GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE)) {
                        if (GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE.typedata.toString() == "persen") {
                            coinProfitSharingCM = coinTransaction * (Number(GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE.value) / 100);
                        }
                        if (GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE.typedata.toString() == "number") {
                            coinProfitSharingCM = coinTransaction - Number(GET_ID_SETTING_PROFIT_SHARING_CONTENT_MARKETPLACE.value);
                        }
                    }
                }
                if (transactionProductCode == "GF") {
                    const ID_SETTING_PROFIT_SHARING_GIFT = this.configService.get("ID_SETTING_PROFIT_SHARING_GIFT");
                    const GET_ID_SETTING_PROFIT_SHARING_GIFT = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_PROFIT_SHARING_GIFT);
                    if (await this.utilsService.ceckData(GET_ID_SETTING_PROFIT_SHARING_GIFT)) {
                        if (GET_ID_SETTING_PROFIT_SHARING_GIFT.typedata.toString() == "persen") {
                            coinProfitSharingGF = coinTransaction * (Number(GET_ID_SETTING_PROFIT_SHARING_GIFT.value) / 100);
                        }
                        if (GET_ID_SETTING_PROFIT_SHARING_GIFT.typedata.toString() == "number") {
                            coinProfitSharingGF = coinTransaction - Number(GET_ID_SETTING_PROFIT_SHARING_GIFT.value);
                        }
                    }
                }
                if (transactionProductCode == "CN") {
                    const ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN = this.configService.get("ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN");
                    const GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN);
                    if (await this.utilsService.ceckData(GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN)) {
                        if (GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN.typedata.toString() == "persen") {
                            coinProfitSharingPenukaranCoin = coinTransaction * (Number(GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN.value) / 100);
                        }
                        if (GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN.typedata.toString() == "number") {
                            coinProfitSharingPenukaranCoin = coinTransaction - Number(GET_ID_SETTING_PROFIT_SHARING_PENUKARAN_COIN.value);
                        }
                    }
                }

                //Generate Invoice Number
                let generateInvoice = await this.generateInvoice(platform, categoryTransaction.code, transactionProductCode, TransactionCount);

                //Insert Transaction
                let transactionsV2_ = new transactionsV2();
                let transactionsV2_id = new mongoose.Types.ObjectId();
                transactionsV2_._id = transactionsV2_id;
                transactionsV2_.type = categoryTransaction.user;
                transactionsV2_.idTransaction = idTransaction;
                transactionsV2_.noInvoice = generateInvoice;
                transactionsV2_.createdAt = currentDate;
                transactionsV2_.updatedAt = currentDate;
                transactionsV2_.category = categoryTransaction._id;
                transactionsV2_.product = getProduct._id;
                transactionsV2_.status = status;
                transactionsV2_.detail = detail;

                //Set Voucher Diskon
                if (idVoucher != undefined) {
                    let dataIdVoucher = [];
                    if (idVoucher.length > 0) {
                        for (let voc = 0; voc < idVoucher.length; voc++) {
                            dataIdVoucher.push(new mongoose.Types.ObjectId(idVoucher[voc]))
                        }
                    }
                    transactionsV2_.voucherDiskon = dataIdVoucher;
                }

                //Set User Hyppe, coin
                if (categoryTransaction.user == "HYPPE") {
                    typeUser = "USER_HYPPE";
                    idUser = getDataUserHyppe._id;

                    //For Coa
                    let kas = 0;
                    let biayaPaymentGateway = 0;
                    let biayaDiscount = 0;
                    let biayaFreeCreator = 0;

                    let hutangSaldoCoin = 0;
                    let hutangSaldoCredit = 0;

                    let pendapatanBiayaTransaction = 0;
                    let pendapatanPenukaranCoin = 0;
                    let pendapatanContentOwnership = 0;
                    let pendapatanContentMarketPlace = 0;
                    let pendapatanBoostPost = 0;
                    let pendapatanLiveGift = 0;
                    let pendapatanContentGift = 0;
                    let pendapatanAdvertisement = 0;
                    let pendapatanDiTarik = 0;

                    let modalDiSetor = 0;
                    let allProductPendapatan = 0;

                    if (categoryTransaction.type != undefined) {
                        if (categoryTransaction.type.length > 0) {
                            for (let uh = 0; uh < categoryTransaction.type.length; uh++) {
                                let categoryTransactionType = categoryTransaction.type[uh];
                                if (getProduct._id.toString() == categoryTransactionType.idProduct.toString()) {
                                    if (categoryTransactionType.transaction != undefined) {
                                        if (categoryTransactionType.transaction.length > 0) {
                                            for (let tr = 0; tr < categoryTransactionType.transaction.length; tr++) {
                                                if (categoryTransactionType.transaction[tr].name != undefined) {
                                                    if (categoryTransactionType.transaction[tr].name == "BalacedCoin") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                coinDiscount = discountCoin;
                                                                coin = coinTransaction;
                                                                totalCoin = coinTransaction - coinDiscount;
                                                                debet = coinTransaction - coinDiscount;
                                                                kredit = 0;
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                coin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                totalCoin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                debet = 0;
                                                                kredit = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "HutangCoin") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                hutangSaldoCoin = 0;
                                                                if (categoryTransaction.code == "BHS") {
                                                                    let hutangCoin_ = coinTransaction - (coinProfitSharingCM + coinProfitSharingGF);
                                                                    hutangSaldoCoin += Number(currencyCoin) * hutangCoin_;
                                                                } else {
                                                                    let hutangCoin_ = coinTransaction - (coinProfitSharingCM + coinProfitSharingGF) - discountCoin;
                                                                    hutangSaldoCoin += Number(currencyCoin) * hutangCoin_;
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                hutangSaldoCoin = 0;
                                                                let hutangCoin_ = -1 * (coinTransaction - discountCoin);
                                                                hutangSaldoCoin += Number(currencyCoin) * hutangCoin_;
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "HutangCredit") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                let dataGrandTotalCredit = 0;
                                                                for (let k = 0; k < detail.length; k++) {
                                                                    let dataDetail = detail[k];
                                                                    let dataCredit = 0;
                                                                    let dataQty = 0;
                                                                    let dataTotalCredit = 0;
                                                                    if (dataDetail.credit != undefined) {
                                                                        dataCredit = dataDetail.credit;
                                                                    }
                                                                    if (dataDetail.qty != undefined) {
                                                                        dataQty = dataDetail.qty;
                                                                    }
                                                                    dataTotalCredit = Number(dataCredit) * Number(dataQty);
                                                                    dataGrandTotalCredit += dataTotalCredit;
                                                                }
                                                                hutangSaldoCredit = ((Number(currencyCredit) * Number(currencyCoin)) * dataGrandTotalCredit);
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                let dataGrandTotalCredit = 0;
                                                                for (let k = 0; k < detail.length; k++) {
                                                                    let dataDetail = detail[k];
                                                                    let dataCredit = 0;
                                                                    let dataQty = 0;
                                                                    let dataTotalCredit = 0;
                                                                    if (dataDetail.credit != undefined) {
                                                                        dataCredit = dataDetail.credit;
                                                                    }
                                                                    if (dataDetail.qty != undefined) {
                                                                        dataQty = dataDetail.qty;
                                                                    }
                                                                    dataTotalCredit = Number(dataCredit) * Number(dataQty);
                                                                    dataGrandTotalCredit += dataTotalCredit;
                                                                }
                                                                hutangSaldoCredit = -1 * ((Number(currencyCredit) * Number(currencyCoin)) * dataGrandTotalCredit);
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanContentMarketPlace") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                let pendapatanContentMarketPlace_ = coinProfitSharingCM;
                                                                pendapatanContentMarketPlace = (Number(currencyCoin) * pendapatanContentMarketPlace_);
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                let pendapatanContentMarketPlace_ = coinProfitSharingCM;
                                                                pendapatanContentMarketPlace = -1 * (Number(currencyCoin) * pendapatanContentMarketPlace_);
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanContentOwnership") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                let pendapatanContentOwnership_ = coinTransaction;
                                                                pendapatanContentOwnership = (Number(currencyCoin) * pendapatanContentOwnership_);
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                let pendapatanContentOwnership_ = coinTransaction;
                                                                pendapatanContentOwnership = -1 * (Number(currencyCoin) * pendapatanContentOwnership_);
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanBoostPost") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                let pendapatanBoostPost_ = coinTransaction;
                                                                pendapatanBoostPost = (Number(currencyCoin) * pendapatanBoostPost_);
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                let pendapatanBoostPost_ = coinTransaction;
                                                                pendapatanBoostPost = -1 * (Number(currencyCoin) * pendapatanBoostPost_);
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanContentGift") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanContentGift_ = coinProfitSharingGF;
                                                                        pendapatanContentGift = (Number(currencyCoin) * pendapatanContentGift_);
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanContentGift_ = coinProfitSharingGF;
                                                                        pendapatanContentGift = -1 * (Number(currencyCoin) * pendapatanContentGift_);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanLiveGift") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanLiveGift_ = coinProfitSharingGF;
                                                                        pendapatanLiveGift = (Number(currencyCoin) * pendapatanLiveGift_);
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanLiveGift_ = coinProfitSharingGF;
                                                                        pendapatanLiveGift = -1 * (Number(currencyCoin) * pendapatanLiveGift_);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "Kas") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        for (let j = 0; j < detail.length; j++) {
                                                                            let dataDetail = detail[j];
                                                                            if (dataDetail.biayPG != undefined) {
                                                                                kas += Number(dataDetail.biayPG);
                                                                            }
                                                                            if (dataDetail.amount != undefined) {
                                                                                kas += Number(dataDetail.amount);
                                                                            }
                                                                            if (dataDetail.totalDiskon != undefined) {
                                                                                kas += (-1 * Number(dataDetail.totalDiskon));
                                                                            }
                                                                            // if (dataDetail.response != undefined) {
                                                                            //     if (dataDetail.response.status != undefined) {
                                                                            //         if (dataDetail.response.code != undefined) {
                                                                            //             if (dataDetail.response.code == "000") {
                                                                            //                 if (dataDetail.biayPG != undefined) {
                                                                            //                     kas += Number(dataDetail.biayPG);
                                                                            //                 }
                                                                            //                 if (dataDetail.amount != undefined) {
                                                                            //                     kas += Number(dataDetail.amount);
                                                                            //                 }
                                                                            //                 if (dataDetail.totalDiskon != undefined) {
                                                                            //                     kas += (-1 * Number(dataDetail.totalDiskon));
                                                                            //                 }
                                                                            //             }
                                                                            //         }
                                                                            //     }
                                                                            // }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        for (let j = 0; j < detail.length; j++) {
                                                                            let dataDetail = detail[j];
                                                                            // if (dataDetail.transactionFees != undefined) {
                                                                            //     kas += (-1 * Number(dataDetail.transactionFees));
                                                                            // }
                                                                            if (dataDetail.response != undefined) {
                                                                                if (dataDetail.response.status != undefined) {
                                                                                    if (dataDetail.response.code != undefined) {
                                                                                        if (dataDetail.response.code == "000") {
                                                                                            if (dataDetail.biayPG != undefined) {
                                                                                                kas += Number(dataDetail.biayPG);
                                                                                            }
                                                                                            if (dataDetail.amount != undefined) {
                                                                                                kas += (-1 * Number(dataDetail.amount));
                                                                                            }
                                                                                            if (dataDetail.totalDiskon != undefined) {
                                                                                                kas += Number(dataDetail.totalDiskon);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "BiayaPG") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        for (let j = 0; j < detail.length; j++) {
                                                                            let dataDetail = detail[j];
                                                                            if (dataDetail.biayPG != undefined) {
                                                                                biayaPaymentGateway += Number(dataDetail.biayPG);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        for (let j = 0; j < detail.length; j++) {
                                                                            let dataDetail = detail[j];
                                                                            if (dataDetail.biayPG != undefined) {
                                                                                biayaPaymentGateway += (-1 * Number(dataDetail.biayPG));
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanBiayaTransaksi") {
                                                        let BiayaTransaction = 0;
                                                        const ID_SETTING_COST_BUY_COIN = this.configService.get("ID_SETTING_COST_BUY_COIN");
                                                        const GET_ID_SETTING_COST_BUY_COIN = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_COST_BUY_COIN);
                                                        if (await this.utilsService.ceckData(GET_ID_SETTING_COST_BUY_COIN)) {
                                                            if (GET_ID_SETTING_COST_BUY_COIN.typedata.toString() == "number") {
                                                                BiayaTransaction = Number(GET_ID_SETTING_COST_BUY_COIN.value);
                                                            }
                                                        }
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                pendapatanBiayaTransaction = BiayaTransaction;
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                pendapatanBiayaTransaction = -1 * BiayaTransaction;
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanPenukaranCoin") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanPenukaranCoin_ = coinProfitSharingPenukaranCoin;
                                                                        pendapatanPenukaranCoin = (Number(currencyCoin) * pendapatanPenukaranCoin_);
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        let pendapatanPenukaranCoin_ = coinProfitSharingPenukaranCoin;
                                                                        pendapatanPenukaranCoin = -1 * (Number(currencyCoin) * pendapatanPenukaranCoin_);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PenarikanCoin") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {

                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {

                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "PendapatanAdvertisement") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {

                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {

                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (discountCoin != undefined) {
                        if (discountCoin > 0) {
                            if ((categoryTransaction.code != "BHS") && (categoryTransaction.code != "PJR")) {
                                biayaDiscount = Number(discountCoin) * Number(currencyCoin);
                            }
                        }
                    }

                    if (discountRp != undefined) {
                        if (discountRp > 0) {
                            biayaDiscount = discountRp;
                        }
                    }

                    if (category != "CREATE") {
                        //Insert Coa Table
                        let TransactionsCoa_ = new TransactionsCoa();
                        TransactionsCoa_._id = new mongoose.Types.ObjectId();
                        TransactionsCoa_.coaTransaction = generateInvoice;
                        TransactionsCoa_.asset = {
                            kas: kas,
                            biaya: {
                                biayaPaymentGateway: biayaPaymentGateway,
                                biayaDiscount: biayaDiscount,
                                biayaFreeCreator: biayaFreeCreator
                            }
                        };
                        TransactionsCoa_.hutang = {
                            hutangSaldoCoin: hutangSaldoCoin,
                            hutangSaldoCredit: hutangSaldoCredit
                        };
                        TransactionsCoa_.ekuitas = {
                            saldoPendapatan: {
                                pendapatanBiayaTransaction: pendapatanBiayaTransaction,
                                pendapatanPenukaranCoin: pendapatanPenukaranCoin,
                                pendapatanContentOwnership: pendapatanContentOwnership,
                                pendapatanContentMarketPlace: pendapatanContentMarketPlace,
                                pendapatanBoostPost: pendapatanBoostPost,
                                pendapatanLiveGift: pendapatanLiveGift,
                                pendapatanContentGift: pendapatanContentGift,
                                pendapatanAdvertisement: pendapatanAdvertisement
                            },
                            saldoDiTarik: {
                                pendapatanDiTarik: pendapatanDiTarik
                            }
                        };
                        TransactionsCoa_.modal = {
                            modalDiSetor: modalDiSetor
                        }
                        TransactionsCoa_.allProductPendapatan = allProductPendapatan;
                        TransactionsCoa_.idTransaction = idTransaction;
                        TransactionsCoa_.idCoinSettings = currencyCoinId;
                        TransactionsCoa_.createdAt = currentDate;
                        TransactionsCoa_.updatedAt = currentDate;
                        TransactionsCoa_.product = getProduct._id;
                        TransactionsCoa_.category = categoryTransaction._id;
                        TransactionsCoa_.status = status;
                        await this.transactionsCoaService.create(TransactionsCoa_);

                        //Insert Coa Table
                        let TransactionsCoaTable_ = new TransactionsCoaTable();
                        TransactionsCoaTable_._id = new mongoose.Types.ObjectId();
                        TransactionsCoaTable_.coaTransaction = generateInvoice;
                        TransactionsCoaTable_.kas = kas;
                        TransactionsCoaTable_.biayaPaymentGateway = biayaPaymentGateway;
                        TransactionsCoaTable_.biayaDiscount = biayaDiscount;
                        TransactionsCoaTable_.biayaFreeCreator = biayaFreeCreator;
                        TransactionsCoaTable_.hutangSaldoCoin = hutangSaldoCoin;
                        TransactionsCoaTable_.hutangSaldoCredit = hutangSaldoCredit;
                        TransactionsCoaTable_.pendapatanBiayaTransaction = pendapatanBiayaTransaction;
                        TransactionsCoaTable_.pendapatanPenukaranCoin = pendapatanPenukaranCoin;
                        TransactionsCoaTable_.pendapatanContentOwnership = pendapatanContentOwnership;
                        TransactionsCoaTable_.pendapatanContentMarketPlace = pendapatanContentMarketPlace;
                        TransactionsCoaTable_.pendapatanBoostPost = pendapatanBoostPost;
                        TransactionsCoaTable_.pendapatanLiveGift = pendapatanLiveGift;
                        TransactionsCoaTable_.pendapatanContentGift = pendapatanContentGift;
                        TransactionsCoaTable_.pendapatanAdvertisement = pendapatanAdvertisement;
                        TransactionsCoaTable_.pendapatanDiTarik = pendapatanDiTarik;
                        TransactionsCoaTable_.modalDiSetor = modalDiSetor;
                        TransactionsCoaTable_.allProductPendapatan = allProductPendapatan;
                        TransactionsCoaTable_.createdAt = currentDate;
                        TransactionsCoaTable_.updatedAt = currentDate;
                        TransactionsCoaTable_.idTransaction = idTransaction;
                        TransactionsCoaTable_.idCoinSettings = currencyCoinId;
                        TransactionsCoaTable_.product = getProduct._id;
                        TransactionsCoaTable_.category = categoryTransaction._id;
                        TransactionsCoaTable_.status = status;
                        await this.transactionsCoaTableService.create(TransactionsCoaTable_);
                    }
                }

                //Set User, coin
                if (categoryTransaction.user == "USER") {
                    if (categoryTransaction.code == "PNC") {
                        typeUser = "USER_SELL";
                        idUser = getDataUserSell._id;
                        coinDiscount = 0;
                    } else if (categoryTransaction.code == "PCM") {
                        typeUser = "USER_BUY";
                        idUser = getDataUserBuy._id;
                        coinDiscount = 0;
                    } else {
                        typeUser = "USER_BUY";
                        idUser = getDataUserBuy._id;
                        coinDiscount = discountCoin;
                    }

                    if (categoryTransaction.type != undefined) {
                        if (categoryTransaction.type.length > 0) {
                            for (let uh = 0; uh < categoryTransaction.type.length; uh++) {
                                let categoryTransactionType = categoryTransaction.type[uh];
                                if (getProduct._id.toString() == categoryTransactionType.idProduct.toString()) {
                                    if (categoryTransactionType.transaction != undefined) {
                                        if (categoryTransactionType.transaction.length > 0) {
                                            for (let tr = 0; tr < categoryTransactionType.transaction.length; tr++) {
                                                if (categoryTransactionType.transaction[tr].name != undefined) {
                                                    if (categoryTransactionType.transaction[tr].name == "BalacedCoin") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        coin = coinTransaction;
                                                                        totalCoin = coinTransaction - coinDiscount;
                                                                        debet = 0;
                                                                        kredit = coinTransaction - coinDiscount;
                                                                    }
                                                                    // if (categoryTransactionType.category == "Live") {
                                                                    // }
                                                                } else {
                                                                    coin = coinTransaction;
                                                                    totalCoin = coinTransaction - coinDiscount;
                                                                    debet = 0;
                                                                    kredit = coinTransaction - coinDiscount;
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (categoryTransactionType.category != undefined) {
                                                                    if (categoryTransactionType.category == category) {
                                                                        coin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                        totalCoin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                        debet = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                        kredit = 0;
                                                                    }
                                                                    // if (categoryTransactionType.category == "Live") {
                                                                    // }
                                                                } else {
                                                                    coin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                    totalCoin = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                    debet = coinTransaction - coinProfitSharingCM - coinProfitSharingGF;
                                                                    kredit = 0;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (categoryTransactionType.transaction[tr].name == "BalacedCredit") {
                                                        if (categoryTransactionType.transaction[tr].status != undefined) {
                                                            if (categoryTransactionType.transaction[tr].status == "debit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        let dataGrandTotalCredit = 0;
                                                                        for (let k = 0; k < detail.length; k++) {
                                                                            let dataDetail = detail[k];
                                                                            let dataCredit = 0;
                                                                            let dataQty = 0;
                                                                            let dataTotalCredit = 0;
                                                                            if (dataDetail.credit != undefined) {
                                                                                dataCredit = dataDetail.credit;
                                                                            }
                                                                            if (dataDetail.qty != undefined) {
                                                                                dataQty = dataDetail.qty;
                                                                            }
                                                                            dataTotalCredit = Number(dataCredit) * Number(dataQty);
                                                                            dataGrandTotalCredit += dataTotalCredit;
                                                                        }
                                                                        let AdsBalaceCredit_ = new AdsBalaceCredit();
                                                                        AdsBalaceCredit_._id = new mongoose.Types.ObjectId();
                                                                        AdsBalaceCredit_.iduser = new mongoose.Types.ObjectId(idUser);
                                                                        AdsBalaceCredit_.debet = dataGrandTotalCredit;
                                                                        AdsBalaceCredit_.type = "TOPUP";
                                                                        AdsBalaceCredit_.kredit = 0;
                                                                        AdsBalaceCredit_.idtrans = transactionsV2_id;
                                                                        AdsBalaceCredit_.timestamp = await this.utilsService.getDateTimeString();
                                                                        AdsBalaceCredit_.description = "BUY PAKET CREDIT";
                                                                        AdsBalaceCredit_.idAdspricecredits = currencyCreditId;
                                                                        await this.adsBalaceCreditService.create(AdsBalaceCredit_);
                                                                    }
                                                                }
                                                            }
                                                            if (categoryTransactionType.transaction[tr].status == "credit") {
                                                                if (detail != undefined) {
                                                                    if (detail.length > 0) {
                                                                        let dataGrandTotalCredit = 0;
                                                                        for (let k = 0; k < detail.length; k++) {
                                                                            let dataDetail = detail[k];
                                                                            dataGrandTotalCredit = dataDetail.credit;
                                                                        }
                                                                        credit = dataGrandTotalCredit;
                                                                        let AdsBalaceCredit_ = new AdsBalaceCredit();
                                                                        AdsBalaceCredit_._id = new mongoose.Types.ObjectId();
                                                                        AdsBalaceCredit_.iduser = new mongoose.Types.ObjectId(idUser);
                                                                        AdsBalaceCredit_.debet = 0;
                                                                        AdsBalaceCredit_.type = "USE";
                                                                        AdsBalaceCredit_.kredit = dataGrandTotalCredit;
                                                                        AdsBalaceCredit_.idtrans = transactionsV2_id;
                                                                        AdsBalaceCredit_.timestamp = await this.utilsService.getDateTimeString();
                                                                        AdsBalaceCredit_.description = "USE ADS CREATE";
                                                                        AdsBalaceCredit_.idAdspricecredits = currencyCreditId;
                                                                        await this.adsBalaceCreditService.create(AdsBalaceCredit_);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (category != undefined) {
                    transactionsV2_.typeCategory = category;
                }
                transactionsV2_.idUser = idUser;
                transactionsV2_.coinDiscount = coinDiscount;
                transactionsV2_.coin = coin;
                transactionsV2_.totalCoin = totalCoin;
                transactionsV2_.priceDiscont = priceDiscont;
                transactionsV2_.price = price;
                transactionsV2_.credit = credit;
                transactionsV2_.totalPrice = totalPrice;
                transactionsV2_.typeUser = typeUser;
                await this.transactionsModel.create(transactionsV2_);

                outputdatatransaction.push(transactionsV2_);

                //Get Saldo
                let balancedUser = await this.transactionsBalancedsService.findsaldo(idUser.toString());
                if (await this.utilsService.ceckData(balancedUser)) {
                    if (balancedUser.length > 0) {
                        saldo = balancedUser[0].totalSaldo;
                    }
                }

                if (category != "CREATE") {
                    if (status == "SUCCESS") {
                        //Insert Balanceds
                        let Balanceds_ = new TransactionsBalanceds();
                        Balanceds_._id = new mongoose.Types.ObjectId();
                        Balanceds_.idTransaction = transactionsV2_id;
                        Balanceds_.idUser = idUser;
                        Balanceds_.debit = debet;
                        Balanceds_.credit = kredit;
                        Balanceds_.saldo = saldo - kredit + debet;
                        Balanceds_.noInvoice = generateInvoice;
                        Balanceds_.createdAt = currentDate;
                        Balanceds_.updatedAt = currentDate;
                        Balanceds_.userType = categoryTransaction.user;
                        Balanceds_.coa = [];
                        Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
                        await this.transactionsBalancedsService.create(Balanceds_);
                    } else {
                        if (category == "WD") {
                            //Insert Balanceds
                            let Balanceds_ = new TransactionsBalanceds();
                            Balanceds_._id = new mongoose.Types.ObjectId();
                            Balanceds_.idTransaction = transactionsV2_id;
                            Balanceds_.idUser = idUser;
                            Balanceds_.debit = debet;
                            Balanceds_.credit = kredit;
                            Balanceds_.saldo = saldo - kredit + debet;
                            Balanceds_.noInvoice = generateInvoice;
                            Balanceds_.createdAt = currentDate;
                            Balanceds_.updatedAt = currentDate;
                            Balanceds_.userType = categoryTransaction.user;
                            Balanceds_.coa = [];
                            Balanceds_.remark = "Insert Balanced " + categoryTransaction.user;
                            await this.transactionsBalancedsService.create(Balanceds_);
                        }
                    }
                }
            }
            return {
                "success": true,
                "data": outputdatatransaction
            };
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async generateInvoice(Platform: string, categoryTransaction: string, codeProduct: string, No: number) {
        let TransactionInvoice = "";

        //Year Code
        const CurrentDate = new Date();
        const Year = CurrentDate.getFullYear();

        //Platform Code
        let PlatformCode = "UNKNOWN";
        if (Platform.toUpperCase() == "APP") {
            PlatformCode = "APP";
        } else if (Platform.toUpperCase() == "BUS") {
            PlatformCode = "BUS";
        } else if (Platform.toUpperCase() == "CON") {
            PlatformCode = "CON";
        } else {
            PlatformCode = "UNKNOWN";
        }

        //Transaction Code
        let TransactionNumber = ""
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

    async generateIdTransaction() {
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

    async getCoinHistory(email: string, skip: number, limit: number, descending: boolean, dateFrom?: string, dateTo?: string, type?: string[]) {
        const userData = await this.userbasicnewService.findBymail(email);
        let order = 0;
        let pipeline = [];

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        };

        let matchAnd = [];
        matchAnd.push({
            idUser: userData._id
        });
        if (dateFrom) matchAnd.push({
            createdAt: {
                $gte: dateFrom + " 00:00:00"
            }
        });
        if (dateTo) matchAnd.push({
            createdAt: {
                $lte: dateTo + " 23:59:59"
            }
        });

        pipeline.push(
            {
                $match: {
                    $and: matchAnd
                }
            },
            {
                $lookup: {
                    from: "transactionsCategorys",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            {
                $project: {
                    idTransaction: 1,
                    noInvoice: 1,
                    totalCoin: 1,
                    createdAt: 1,
                    categoryData: {
                        $arrayElemAt: ["$categoryData", 0]
                    }
                }
            },
            {
                $match: {
                    "categoryData.code": {
                        $in: (type && type.length > 0) ? type : ["PBC", "PGC", "PUC"]
                    }
                }
            },
            {
                $sort: {
                    createdAt: order
                }
            }
        );
        if (skip > 0) pipeline.push({ $skip: skip * limit });
        if (limit > 0) pipeline.push({ $limit: limit });

        let data = await this.transactionsModel.aggregate(pipeline);
        return data;
    }

    async getdetailtransaksinew(iduserbuyer: string, nova: string) {

        var pipeline = [];

        pipeline.push(
            {


                $match: {
                    "idUser": new mongoose.Types.ObjectId(iduserbuyer),
                    "type": "USER",
                    'detail.payload.va_number': nova
                }
            },
            {
                $lookup: {
                    from: "transactionsProducts",
                    localField: "product",
                    foreignField: "_id",
                    as: "dataproduk"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "databasic"
                }
            },

            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "emailbuyer": {
                        $arrayElemAt: ['$databasic.email', 0]
                    },
                    "va_number": {
                        $arrayElemAt: ['$detail.payload.va_number', 0]
                    },
                    "transactionFees": {
                        $arrayElemAt: ['$detail.transactionFees', 0]
                    },
                    "biayPG": {
                        $arrayElemAt: ['$detail.biayPG', 0]
                    },
                    "code": {
                        $arrayElemAt: ['$dataproduk.code', 0]
                    },
                    "namePaket": {
                        $arrayElemAt: ['$dataproduk.name', 0]
                    },
                    "post_id": {
                        $arrayElemAt: ['$detail.postID', 0]
                    }
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "va_number",
                    foreignField: "nova",
                    as: "datatr"
                }
            },
            {
                $lookup: {
                    from: "newPosts",
                    localField: "post_id",
                    foreignField: "postID",
                    as: "datapost"
                }
            },
            {
                $project: {
                    "type": 1,
                    "emailbuyer": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    //"status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": {
                        $arrayElemAt: ['$datatr.amount', 0]
                    },
                    "paymentmethod": {
                        $arrayElemAt: ['$datatr.paymentmethod', 0]
                    },
                    "status": {
                        $arrayElemAt: ['$datatr.status', 0]
                    },
                    "description": {
                        $arrayElemAt: ['$datatr.description', 0]
                    },
                    "bank": {
                        $arrayElemAt: ['$datatr.bank', 0]
                    },
                    "totalamount": {
                        $arrayElemAt: ['$datatr.totalamount', 0]
                    },
                    "product_id": {
                        $arrayElemAt: ['$datatr.product_id', 0]
                    },
                    "expiredtimeva": {
                        $arrayElemAt: ['$datatr.expiredtimeva', 0]
                    },
                    "post_id": 1,
                    "post_type": {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'pict']
                                    },
                                    'then': "HyppePic"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'vid']
                                    },
                                    'then': "HyppeVid"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'diary']
                                    },
                                    'then': "HyppeVid"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'story']
                                    },
                                    'then': "HyppeStory"
                                },

                            ],
                            default: ''
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "methodepayments",
                    localField: "paymentmethod",
                    foreignField: "_id",
                    as: "datamethod"
                }
            },
            {
                $lookup: {
                    from: "monetize",
                    localField: "product_id",
                    foreignField: "package_id",
                    as: "monetdata"
                }
            },
            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "emailbuyer": 1,
                    "category": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": 1,
                    "paymentmethod": 1,
                    "description": 1,
                    "bank": 1,
                    "totalamount": 1,
                    "product_id": 1,
                    "expiredtimeva": 1,
                    "methodename": {
                        $arrayElemAt: ['$datamethod.methodename', 0]
                    },
                    "productName": {
                        $arrayElemAt: ['$monetdata.name', 0]
                    },
                    "post_id": 1,
                    "post_type": 1
                }
            },
            {
                $lookup: {
                    from: "banks",
                    localField: "bank",
                    foreignField: "_id",
                    as: "databank"
                }
            },
            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                    "emailbuyer": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    // "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "expiredtimeva": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": 1,
                    "paymentmethod": 1,
                    "description": 1,
                    "bank": 1,
                    "totalamount": 1,
                    "product_id": 1,
                    "methodename": 1,
                    "productName": 1,
                    "timenow": 1,
                    "bankname": {
                        $arrayElemAt: ['$databank.bankname', 0]
                    },
                    "bankcode": {
                        $arrayElemAt: ['$databank.bankcode', 0]
                    },
                    "urlEbanking": {
                        $arrayElemAt: ['$databank.urlEbanking', 0]
                    },
                    "bankIcon": {
                        $arrayElemAt: ['$databank.bankIcon', 0]
                    },
                    "atm": {
                        $arrayElemAt: ['$databank.atm', 0]
                    },
                    "internetBanking": {
                        $arrayElemAt: ['$databank.internetBanking', 0]
                    },
                    "mobileBanking": {
                        $arrayElemAt: ['$databank.mobileBanking', 0]
                    },
                    "jenisTransaksi": "Pembelian Coins",
                    "post_id": 1,
                    "post_type": 1
                }
            },

        );
        let query = await this.transactionsModel.aggregate(pipeline);
        return query[0];
    }

    async getdetailtransaksinewinvoiceonly(noinvoice: string) {

        var pipeline = [];

        pipeline.push(
            {
                $match: {
                    "type": "USER",
                    'noInvoice': noinvoice
                }
            },
            {
                $lookup: {
                    from: "transactionsProducts",
                    localField: "product",
                    foreignField: "_id",
                    as: "dataproduk"
                }
            },
            {
                "$lookup": {
                    from: "transactionsCategorys",
                    as: "coa",
                    let: {
                        localID: "$product",
                        cat: '$category'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and:
                                    [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$cat']
                                            }
                                        },

                                    ]
                            }
                        },
                        {
                            $set: {
                                kecoa: {
                                    $arrayElemAt: ['$type', {
                                        $indexOfArray: ['$type.idProduct', '$$localID']
                                    }]
                                }
                            }
                        },
                        {
                            $project: {
                                index: {
                                    $indexOfArray: ['$type.idProduct', '$$localID']
                                },
                                coa: {
                                    $arrayElemAt: ['$type.name', {
                                        $indexOfArray: ['$type.idProduct', '$$localID']
                                    }]
                                },
                                coaDetailName: {
                                    $arrayElemAt: ['$kecoa.transaction.name', 0]
                                },
                                coaDetailStatus: {
                                    $arrayElemAt: ['$kecoa.transaction.status', 0]
                                },
                            }
                        }
                    ],

                },

            },
            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "emailbuyer": {
                        $arrayElemAt: ['$databasic.email', 0]
                    },
                    "usernamebuyer": {
                        $arrayElemAt: ['$databasic.username', 0]
                    },
                    "va_number": {
                        $ifNull: [{ $arrayElemAt: ['$detail.payload.va_number', 0] }, "-"]
                    },
                    "transactionFees": {
                        $arrayElemAt: ['$detail.transactionFees', 0]
                    },
                    "biayPG": {
                        $arrayElemAt: ['$detail.biayPG', 0]
                    },
                    "withdrawId": {
                        $ifNull: [{ $arrayElemAt: ['$detail.withdrawId', 0] }, "-"]
                    },
                    "typeAdsID": {
                        $ifNull: [{ $arrayElemAt: ['$detail.typeAdsID', 0] }, "-"]
                    },
                    "idStream": {
                        $ifNull: [{ $arrayElemAt: ['$detail.idStream', 0] }, "-"]
                    },
                    "code": {
                        $arrayElemAt: ['$dataproduk.code', 0]
                    },
                    "namePaket": {
                        $arrayElemAt: ['$dataproduk.name', 0]
                    },
                    coa: {
                        $arrayElemAt: ["$coa.coa", 0]
                    },
                    coaDetailName: {
                        $arrayElemAt: ["$coa.coaDetailName", 0]
                    },
                    coaDetailStatus: {
                        $arrayElemAt: ["$coa.coaDetailStatus", 0]
                    },
                    "post_id": {
                        $ifNull: [{ $arrayElemAt: ['$detail.postID', 0] }, "-"]
                    },
                    "gift_id": {
                        $ifNull: [{ $arrayElemAt: ['$detail.id', 0] }, "-"]
                    },
                    "credit": {
                        $ifNull: [{ $arrayElemAt: ['$detail.credit', 0] }, "-"]
                    },
                    "boost_type": {
                        $ifNull: [{ $arrayElemAt: ['$detail.interval.type', 0] }, "-"]
                    },
                    "boost_interval": {
                        $ifNull: [{ $arrayElemAt: ['$detail.interval.value', 0] }, "-"]
                    },
                    "boost_unit": {
                        $ifNull: [{ $arrayElemAt: ['$detail.interval.remark', 0] }, "-"]
                    },
                    "boost_start": {
                        $ifNull: [{ $arrayElemAt: ['$detail.dateStart', 0] }, "-"]
                    },
                    typeCategory: 1,
                    typeUser: 1
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "va_number",
                    foreignField: "nova",
                    as: "datatr"
                }
            },
            {
                $lookup: {
                    from: "newPosts",
                    localField: "post_id",
                    foreignField: "postID",
                    as: "datapost"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "databasic"
                }
            },
            {
                $lookup:
                {

                    from: "newUserBasics",
                    as: "datapembeli",
                    let: {
                        idLocal: {
                            "$arrayElemAt":
                                [
                                    "$detail.pembeli", 0
                                ]
                        }
                    },
                    pipeline: [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                        [
                                            "$$idLocal", "$_id"
                                        ]
                                }
                            }
                        },
                        {
                            "$limit": 1
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "withdraws",
                    localField: "withdrawId",
                    foreignField: "_id",
                    as: "datawithdraw"
                }
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "dataAdsType"
                }
            },
            {
                $lookup: {
                    from: "mediastreaming",
                    localField: "idStream",
                    foreignField: "_id",
                    as: "dataStream"
                }
            },
            {
                $project: {
                    "type": 1,
                    "emailbuyer": {
                        "$ifNull": [
                            {
                                "$cond": {
                                    "if": {
                                        "$eq": [
                                            "$typeUser", "USER_SELL"
                                        ]
                                    },
                                    "then": {
                                        "$arrayElemAt": [
                                            "$datapembeli.email", 0
                                        ]
                                    },
                                    "else": {
                                        "$arrayElemAt": [
                                            "$databasic.email", 0
                                        ]
                                    }
                                }
                            },
                            {
                                "$arrayElemAt": [
                                    "$databasic.email", 0
                                ]
                            }
                        ]
                    },
                    "usernamebuyer": {
                        "$ifNull": [
                            {
                                "$cond": {
                                    "if": {
                                        "$eq": [
                                            "$typeUser", "USER_SELL"
                                        ]
                                    },
                                    "then": {
                                        "$arrayElemAt": [
                                            "$datapembeli.email", 0
                                        ]
                                    },
                                    "else": {
                                        "$arrayElemAt": [
                                            "$databasic.email", 0
                                        ]
                                    }
                                }
                            },
                            {
                                "$arrayElemAt": [
                                    "$databasic.email", 0
                                ]
                            }
                        ]
                    },
                    "emailseller": {
                        "$ifNull": [
                            {
                                "$cond": {
                                    "if": {
                                        "$eq": [
                                            "$typeUser", "USER_SELL"
                                        ]
                                    },
                                    "then": {
                                        "$arrayElemAt": [
                                            "$databasic.email", 0
                                        ]
                                    },
                                    "else": {
                                        "$arrayElemAt": [
                                            "$datapembeli.email", 0
                                        ]
                                    }
                                }
                            },
                            {
                                "$arrayElemAt": [
                                    "$databasic.email", 0
                                ]
                            }
                        ]
                    },
                    "usernameseller": {
                        "$ifNull": [
                            {
                                "$cond": {
                                    "if": {
                                        "$eq": [
                                            "$typeUser", "USER_SELL"
                                        ]
                                    },
                                    "then": {
                                        "$arrayElemAt": [
                                            "$databasic.email", 0
                                        ]
                                    },
                                    "else": {
                                        "$arrayElemAt": [
                                            "$datapembeli.email", 0
                                        ]
                                    }
                                }
                            },
                            {
                                "$arrayElemAt": [
                                    "$databasic.email", 0
                                ]
                            }
                        ]
                    },
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                    "content_id": {
                        "$arrayElemAt": ['$datapost._id', 0]
                    },
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    //"status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "gift_id": 1,
                    "credit": 1,
                    "boost_type": 1,
                    "boost_interval": 1,
                    "boost_unit": 1,
                    "boost_start": 1,
                    "amount": {
                        $arrayElemAt: ['$datatr.amount', 0]
                    },
                    "paymentmethod": {
                        $arrayElemAt: ['$datatr.paymentmethod', 0]
                    },
                    "status": {
                        $ifNull: [{ $arrayElemAt: ['$datatr.status', 0] }, null]
                    },
                    "description": {
                        $arrayElemAt: ['$datatr.description', 0]
                    },
                    "bank": {
                        $arrayElemAt: ['$datatr.bank', 0]
                    },
                    "totalamount": {
                        $arrayElemAt: ['$datatr.totalamount', 0]
                    },
                    "product_id": {
                        $arrayElemAt: ['$datatr.product_id', 0]
                    },
                    "expiredtimeva": {
                        $ifNull: [{ $arrayElemAt: ['$datatr.expiredtimeva', 0] }, null]
                    },
                    "idtr_lama": {
                        $ifNull: [{ $arrayElemAt: ['$datatr._id', 0] }, null]
                    },
                    "post_id": 1,
                    "post_type": {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'pict']
                                    },
                                    'then': "HyppePic"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'vid']
                                    },
                                    'then': "HyppeVid"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'diary']
                                    },
                                    'then': "HyppeVid"
                                },
                                {
                                    'case': {
                                        '$eq': [{ $arrayElemAt: ['$datapost.postType', 0] }, 'story']
                                    },
                                    'then': "HyppeStory"
                                },

                            ],
                            default: '-'
                        }
                    },
                    "post_owner_email": {
                        $ifNull: [{ $arrayElemAt: ['$datapost.email', 0] }, "-"]
                    },
                    withdrawAmount: {
                        $ifNull: [{ $arrayElemAt: ['$datawithdraw.amount', 0] }, 0]
                    },
                    withdrawTotal: {
                        $ifNull: [{ $arrayElemAt: ['$datawithdraw.totalamount', 0] }, 0]
                    },
                    withdrawCost: {
                        $subtract: [{ $ifNull: [{ $arrayElemAt: ['$datawithdraw.amount', 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ['$datawithdraw.totalamount', 0] }, 0] }]
                    },
                    recipientAccId: {
                        $ifNull: [{ $arrayElemAt: ['$datawithdraw.idAccountBank', 0] }, "-"]
                    },
                    recipientUser: {
                        $ifNull: [{ $arrayElemAt: ['$datawithdraw.idUser', 0] }, "-"]
                    },
                    coa: 1,
                    coaDetailName: 1,
                    coaDetailStatus: 1,
                    adType: {
                        $ifNull: [{ $arrayElemAt: ['$dataAdsType.nameType', 0] }, "-"]
                    },
                    idStream: 1,
                    titleStream: {
                        $ifNull: [{ $arrayElemAt: ['$dataStream.title', 0] }, "-"]
                    },
                    typeCategory: 1,
                    typeUser: 1
                }
            },
            {
                $lookup: {
                    from: "methodepayments",
                    localField: "paymentmethod",
                    foreignField: "_id",
                    as: "datamethod"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "post_owner_email",
                    foreignField: "email",
                    as: "datapostowner"
                }
            },
            // {
            //     $lookup: {
            //         from: "monetize",
            //         localField: "product_id",
            //         foreignField: "package_id",
            //         as: "monetdata"
            //     }
            // },
            {
                "$lookup":
                {
                    from: "monetize",
                    let:
                    {
                        "product_id": "$product_id",
                        "gift_id": "$gift_id"
                    },
                    as: "monetdata",
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$or":
                                        [
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$$product_id", "$package_id",
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$$gift_id", "$_id",
                                                        ]
                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$limit": 1
                            }
                        ]
                }
            },
            {
                $lookup: {
                    from: "userbankaccounts",
                    localField: "recipientAccId",
                    foreignField: "_id",
                    as: "recipientaccdata"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "recipientUser",
                    foreignField: "_id",
                    as: "recipientuserdata"
                }
            },
            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "emailbuyer": 1,
                    "usernamebuyer": 1,
                    "emailseller": 1,
                    "usernameseller": 1,
                    "category": 1,
                    "content_id": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": 1,
                    "paymentmethod": 1,
                    "description": 1,
                    "bank": 1,
                    "totalamount": 1,
                    "product_id": 1,
                    "expiredtimeva": 1,
                    "idtr_lama": 1,
                    "methodename": {
                        $arrayElemAt: ['$datamethod.methodename', 0]
                    },
                    "productName": {
                        $arrayElemAt: ['$monetdata.name', 0]
                    },
                    "package_id": {
                        $arrayElemAt: ['$monetdata.package_id', 0]
                    },
                    "post_id": 1,
                    "post_type": 1,
                    "post_owner": {
                        $arrayElemAt: ['$datapostowner.username', 0]
                    },
                    "credit": 1,
                    "boost_type": 1,
                    "boost_interval": 1,
                    "boost_unit": 1,
                    "boost_start": 1,
                    withdrawAmount: 1,
                    withdrawTotal: 1,
                    withdrawCost: 1,
                    recipientNoRek: {
                        $arrayElemAt: ['$recipientaccdata.noRek', 0]
                    },
                    recipientName: {
                        $arrayElemAt: ['$recipientaccdata.nama', 0]
                    },
                    recipientUsername: {
                        $arrayElemAt: ['$recipientuserdata.username', 0]
                    },
                    recipientBankId: {
                        $arrayElemAt: ['$recipientaccdata.idBank', 0]
                    },
                    coa: 1,
                    coaDetailName: 1,
                    coaDetailStatus: 1,
                    adType: 1,
                    idStream: 1,
                    titleStream: 1,
                    typeCategory: 1,
                    typeUser: 1
                }
            },
            {
                $lookup: {
                    from: "banks",
                    localField: "bank",
                    foreignField: "_id",
                    as: "databank"
                }
            },
            {
                $lookup: {
                    from: "banks",
                    localField: "recipientBankId",
                    foreignField: "_id",
                    as: "datarecipientbank"
                }
            },
            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "content_id": 1,
                    "category": 1,
                    "emailbuyer": 1,
                    "usernamebuyer": 1,
                    "emailseller": 1,
                    "usernameseller": 1,
                    "product": 1,
                    "voucherDiskon": 1,
                    "idUser": 1,
                    "coinDiscount": 1,
                    "coin": 1,
                    "totalCoin": 1,
                    "priceDiscont": 1,
                    "price": 1,
                    "totalPrice": 1,
                    "status": 1,
                    // "detail": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "va_number": 1,
                    "expiredtimeva": 1,
                    "idtr_lama": 1,
                    "transactionFees": 1,
                    "biayPG": 1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": 1,
                    "paymentmethod": 1,
                    "description": 1,
                    "bank": 1,
                    "totalamount": 1,
                    "product_id": 1,
                    "methodename": 1,
                    "productName": 1,
                    "package_id": 1,
                    "timenow": 1,
                    "bankname": {
                        $arrayElemAt: ['$databank.bankname', 0]
                    },
                    "bankcode": {
                        $arrayElemAt: ['$databank.bankcode', 0]
                    },
                    "urlEbanking": {
                        $arrayElemAt: ['$databank.urlEbanking', 0]
                    },
                    "bankIcon": {
                        $arrayElemAt: ['$databank.bankIcon', 0]
                    },
                    "atm": {
                        $arrayElemAt: ['$databank.atm', 0]
                    },
                    "internetBanking": {
                        $arrayElemAt: ['$databank.internetBanking', 0]
                    },
                    "mobileBanking": {
                        $arrayElemAt: ['$databank.mobileBanking', 0]
                    },
                    // "jenisTransaksi": "Pembelian Coins",
                    "post_id": 1,
                    "post_type": 1,
                    "post_owner": 1,
                    "credit": 1,
                    "boost_type": 1,
                    "boost_interval": 1,
                    "boost_unit": 1,
                    "boost_start": 1,
                    withdrawAmount: 1,
                    withdrawTotal: 1,
                    withdrawCost: 1,
                    recipientNoRek: 1,
                    recipientName: 1,
                    recipientUsername: 1,
                    recipientBankName: {
                        $arrayElemAt: ['$datarecipientbank.bankname', 0]
                    },
                    coa: 1,
                    coaDetailName: 1,
                    coaDetailStatus: 1,
                    adType: 1,
                    idStream: 1,
                    titleStream: 1,
                    typeCategory: 1,
                    typeUser: 1
                }
            },

        );

        // let util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }));
        let query = await this.transactionsModel.aggregate(pipeline);
        return query[0];
    }

    async consoleWithdrawDetail(noInvoice: string) {
        let query = await this.transactionsModel.aggregate([
            {
                $match: {
                    noInvoice: noInvoice
                }
            },
            {
                $lookup: {
                    from: "withdraws",
                    let: {
                        local_id: { $arrayElemAt: ["$detail.withdrawId", 0] }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$local_id"]
                                }
                            }
                        }
                    ],
                    as: "withdrawdata"
                }
            },
            {
                $unwind: {
                    path: "$withdrawdata"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "withdrawdata.idUser",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    let: { local_id: { $last: "$withdrawdata.tracking.approved_by" } },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$local_id"]
                            }
                        }
                    }],
                    as: "approverdata"
                }
            },
            {
                $lookup: {
                    from: "userbankaccounts",
                    localField: "withdrawdata.idAccountBank",
                    foreignField: "_id",
                    as: "bankaccdata"
                }
            },
            {
                $lookup: {
                    from: "banks",
                    let: { local_id: { $arrayElemAt: ["$bankaccdata.idBank", 0] } },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$local_id"]
                            }
                        }
                    }],
                    as: "bankdata"
                }
            },
            {
                $project: {
                    idTransaction: 1,
                    noInvoice: 1,
                    totalCoin: 1,
                    createdAt: 1,
                    amount: {
                        $arrayElemAt: ['$detail.amount', 0]
                    },
                    transactionFee: {
                        $add: [{ $arrayElemAt: ['$detail.biayPG', 0] }, { $arrayElemAt: ['$detail.biayAdmin', 0] }]
                    },
                    conversionFee: {
                        $arrayElemAt: ['$detail.transactionFees', 0]
                    },
                    totalAmount: {
                        $arrayElemAt: ['$detail.totalAmount', 0]
                    },
                    email: {
                        $arrayElemAt: ['$userdata.email', 0]
                    },
                    accNo: {
                        $arrayElemAt: ['$bankaccdata.noRek', 0]
                    },
                    accName: {
                        $arrayElemAt: ['$bankaccdata.nama', 0]
                    },
                    bankName: {
                        $arrayElemAt: ['$bankdata.bankname', 0]
                    },
                    status: {
                        $last: "$withdrawdata.tracking.status"
                    },
                    tracking: { $reverseArray: "$withdrawdata.tracking" },
                    approvedBy: { $arrayElemAt: ["$approverdata.fullName", 0] }
                }
            }
        ]);
        return query[0];
    }

    async updateDataStream(
        streamID: string,
        status: boolean,
    ): Promise<any> {
        return await this.disquslogsService.updateDataStream(streamID, status);
    }

    async updateDataStreamSpecificUser(
        streamID: string,
        status: boolean,
        email: string,
        view: number,
    ): Promise<any> {
        return await this.disquslogsService.updateDataStreamSpecificUser(streamID, status, email, view);
    }

    async getCurency() {
        const currencyCoin = (await this.transactionsCoinSettingsService.findStatusActive()).price;
        const currencyCoinId = (await this.transactionsCoinSettingsService.findStatusActive())._id;
        return {
            coin: currencyCoin,
            id: currencyCoinId
        }
    }
}