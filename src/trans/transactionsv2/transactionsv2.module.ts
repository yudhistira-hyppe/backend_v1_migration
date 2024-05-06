import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsV2Service } from './transactionsv2.service';
import { TransactionsV2Controller } from './transactionsv2.controller';
import { TransactionsCategorysService } from './categorys/transactionscategorys.service';
import { TransactionsCategorysController } from './categorys/transactionscategorys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsCategorys, TransactionsCategorysSchema } from './categorys/schema/transactionscategorys.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { TransactionsCoaController } from './coa/transactionscoa.controller';
import { TransactionsCoaService } from './coa/transactionscoa.service';
import { TransactionsCoa, TransactionsCoaSchema } from './coa/schema/transactionscoa.schema';
import { TransactionsBalancedsService } from './balanceds/transactionsbalanceds.service';
import { TransactionsBalancedsController } from './balanceds/transactionsbalanceds.controller';
import { TransactionsBalanceds, TransactionsBalancedsSchema } from './balanceds/schema/transactionsbalanceds.schema';
import { transactionsV2, transactionsV2Schema } from './schema/transactionsv2.schema';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { TransactionsProductsController } from './products/transactionsproducts.controller';
import { TransactionsProducts, TransactionsProductsSchema } from './products/schema/transactionsproducts.schema';
import { TransactionsCoinSettings, TransactionsCoinSettingsSchema } from './coin/schema/transactionscoinsettings.schema';
import { TransactionsCoinSettingsController } from './coin/transactionscoinsettings.controller';
import { TransactionsCoinSettingsService } from './coin/transactionscoinsettings.service';
import { AdsPriceCreditsModule } from '../adsv2/adspricecredits/adspricecredits.module';
import { TransactionsCredits, TransactionsCreditsSchema } from './credit/schema/transactionscredits.schema';
import { TransactionsCreditsController } from './credit/transactionscredits.controller';
import { TransactionsCreditsService } from './credit/transactionscredits.service';
import { TransactionsCoaTable, TransactionsCoaTableSchema } from './coa/schema/transactionscoatable.schema';
import { TransactionsCoaTableService } from './coa/transactionscoatable.service';
import { AdsBalaceCreditModule } from '../adsv2/adsbalacecredit/adsbalacecredit.module';
import { LogapisModule } from '../logapis/logapis.module';
import { Monetizenew2Service } from './monetizenew/monetizenew.service';
import { transactionCoin3Service } from './monetizenew/transactionCoin.service';
import { monetizenew2Schema, Monetizenew2 } from './monetizenew/schemas/monetizenew.schema';
import { transactionCoin3Schema, transactionCoin3 } from './monetizenew/schemas/transactionCoin.schema';
@Module({

    imports: [
        LogapisModule,
        AdsPriceCreditsModule,
        AdsBalaceCreditModule,
        UserbasicnewModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: TransactionsCategorys.name, schema: TransactionsCategorysSchema },
            { name: TransactionsCoa.name, schema: TransactionsCoaSchema }, 
            { name: TransactionsBalanceds.name, schema: TransactionsBalancedsSchema },
            { name: TransactionsProducts.name, schema: TransactionsProductsSchema },
            { name: transactionsV2.name, schema: transactionsV2Schema },
            { name: TransactionsCoinSettings.name, schema: TransactionsCoinSettingsSchema },
            { name: TransactionsCredits.name, schema: TransactionsCreditsSchema },
            { name: TransactionsCoaTable.name, schema: TransactionsCoaTableSchema },
            { name: transactionCoin3.name, schema: transactionCoin3Schema },
            { name: Monetizenew2.name, schema: monetizenew2Schema },
        ], 'SERVER_FULL')
    ],
    controllers: [TransactionsV2Controller, TransactionsCategorysController, TransactionsCoaController, TransactionsBalancedsController, TransactionsProductsController, TransactionsCoinSettingsController, TransactionsCreditsController],
    providers: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, TransactionsBalancedsService, TransactionsProductsService, TransactionsCoinSettingsService, TransactionsCreditsService, TransactionsCoaTableService, Monetizenew2Service, transactionCoin3Service],
    exports: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, TransactionsBalancedsService, TransactionsProductsService, TransactionsCoinSettingsService, TransactionsCreditsService, TransactionsCoaTableService, Monetizenew2Service, transactionCoin3Service],
})
export class TransactionsV2Module { }
