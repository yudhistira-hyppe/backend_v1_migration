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
    ) { }

    async updateTransaction() {

    }

    async findByOne(iduser: string,postid:string): Promise<transactionsV2> {
        return this.transactionsModel.findOne({  "type": "USER",
        "idUser": new mongoose.Types.ObjectId(iduser),
                    'detail.postID':postid }).exec();
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
                let coinDiscount = 0;
                let coin = 0;
                let totalCoin = 0;
                let debet = 0;
                let kredit = 0;
                let saldo = 0;
                let coinProfitSharingCM = 0;
                let coinProfitSharingGF = 0;
                let coinProfitSharingPenukaranCoin = 0;

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
                                                                            // if (dataDetail.transactionFees != undefined) {
                                                                            //     kas += Number(dataDetail.transactionFees);
                                                                            // }
                                                                            if (dataDetail.response != undefined){
                                                                                if (dataDetail.response.status != undefined) {
                                                                                    if (dataDetail.response.code != undefined) {
                                                                                        if (dataDetail.response.code == "000") {
                                                                                            if (dataDetail.biayPG != undefined) {
                                                                                                kas += Number(dataDetail.biayPG);
                                                                                            }
                                                                                            if (dataDetail.amount != undefined) {
                                                                                                kas += Number(dataDetail.amount);
                                                                                            }
                                                                                            if (dataDetail.totalDiskon != undefined) {
                                                                                                kas += (-1 * Number(dataDetail.totalDiskon));
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
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
                    await this.transactionsCoaTableService.create(TransactionsCoaTable_);
                }

                //Set User, coin
                if (categoryTransaction.user == "USER") {
                    if (categoryTransaction.code == "PNC") {
                        idUser = getDataUserSell._id;
                        coinDiscount = 0;
                    } else if (categoryTransaction.code == "PCM") {
                        idUser = getDataUserBuy._id;
                        coinDiscount = 0;
                    } else {
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
                                                                // if (detail != undefined) {
                                                                //     if (detail.length > 0) {
                                                                //         let dataGrandTotalCredit = 0;
                                                                //         for (let k = 0; k < detail.length; k++) {
                                                                //             let dataDetail = detail[k];
                                                                //             let dataCredit = 0;
                                                                //             let dataQty = 0;
                                                                //             let dataTotalCredit = 0;
                                                                //             if (dataDetail.credit != undefined) {
                                                                //                 dataCredit = dataDetail.credit;
                                                                //             }
                                                                //             if (dataDetail.qty != undefined) {
                                                                //                 dataQty = dataDetail.qty;
                                                                //             }
                                                                //             dataTotalCredit = Number(dataCredit) * Number(dataQty);
                                                                //             dataGrandTotalCredit += dataTotalCredit;
                                                                //         }
                                                                //         let AdsBalaceCredit_ = new AdsBalaceCredit();
                                                                //         AdsBalaceCredit_._id = new mongoose.Types.ObjectId();
                                                                //         AdsBalaceCredit_.iduser = new mongoose.Types.ObjectId(idUser);
                                                                //         AdsBalaceCredit_.debet = dataGrandTotalCredit;
                                                                //         AdsBalaceCredit_.type = "TOPUP";
                                                                //         AdsBalaceCredit_.kredit = 0;
                                                                //         AdsBalaceCredit_.idtrans = transactionsV2_id;
                                                                //         AdsBalaceCredit_.timestamp = await this.utilsService.getDateTimeString();
                                                                //         AdsBalaceCredit_.description = "BUY PAKET CREDIT";
                                                                //         await this.adsService.insertBalaceDebit(AdsBalaceCredit_);
                                                                //     }
                                                                // }
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

                transactionsV2_.idUser = idUser;
                transactionsV2_.coinDiscount = coinDiscount;
                transactionsV2_.coin = coin;
                transactionsV2_.totalCoin = totalCoin;
                transactionsV2_.priceDiscont = priceDiscont;
                transactionsV2_.price = price;
                transactionsV2_.totalPrice = totalPrice;
                await this.transactionsModel.create(transactionsV2_);

                outputdatatransaction.push(transactionsV2_);

                //Get Saldo
                let balancedUser = await this.transactionsBalancedsService.findsaldo(idUser.toString());
                if (await this.utilsService.ceckData(balancedUser)) {
                    if (balancedUser.length > 0) {
                        saldo = balancedUser[0].totalSaldo;
                    }
                }

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
                }
            }
            return {
                "success":true,
                "data":outputdatatransaction
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

    async getdetailtransaksinew(iduserbuyer: string,nova:string) {

        var pipeline=[];

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
                $project: {
                    "type": 1,
                                "emailbuyer":1,
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
                                 "biayPG":1,
                    "code": 1,
                    "namePaket": 1,
                    "amount": {
                        $arrayElemAt: ['$datatr.amount', 0]
                    },
                    "paymentmethod":  {
                        $arrayElemAt: ['$datatr.paymentmethod', 0]
                    },
                    "status":  {
                        $arrayElemAt: ['$datatr.status', 0]
                    },
                    "description": {
                        $arrayElemAt: ['$datatr.description', 0]
                    },
                    "bank":{
                        $arrayElemAt: ['$datatr.bank', 0]
                    },
                    "totalamount": {
                        $arrayElemAt: ['$datatr.totalamount', 0]
                    },
                    "product_id": {
                        $arrayElemAt: ['$datatr.product_id', 0]
                    },
                    
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
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                                    "emailbuyer":1,
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
                                 "biayPG":1,
                    "code": 1,
                    "namePaket": 1,
                    "amount":1,
                    "paymentmethod":  1,
                    "description": 1,
                    "bank":1,
                    "totalamount": 1,
                    "product_id":1,
                                "methodename":{
                        $arrayElemAt: ['$datamethod.methodename', 0]
                    },
                    
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
                $project: {
                    "type": 1,
                    "idTransaction": 1,
                    "noInvoice": 1,
                    "category": 1,
                                    "emailbuyer":1,
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
                                 "transactionFees": 1,
                                 "biayPG":1,
                    "code": 1,
                    "namePaket": 1,
                    "amount":1,
                    "paymentmethod":  1,
                    "description": 1,
                    "bank":1,
                    "totalamount": 1,
                    "product_id": 1,
                                "methodename":1,
                                "bankname":{
                        $arrayElemAt: ['$databank.bankname', 0]
                    },
                                "bankcode":{
                        $arrayElemAt: ['$databank.bankcode', 0]
                    },
                                "jenisTransaksi":"Pembelian Coins"
                    
                }
            },
        );
        let query = await this.transactionsModel.aggregate(pipeline);
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
}