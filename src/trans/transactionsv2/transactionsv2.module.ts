import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogapisModule } from '../logapis/logapis.module';
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
import { BalancedsService } from './balanceds/balanceds.service';
import { BalancedsController } from './balanceds/balanceds.controller';
import { Balanceds, BalancedsSchema } from './balanceds/schema/balanceds.schema';
import { transactionsV2, transactionsV2Schema } from './schema/transactionsv2.schema';
import { MethodepaymentsModule } from '../methodepayments/methodepayments.module';
import { SettingsModule } from '../settings/settings.module';
import { BanksModule } from '../banks/banks.module';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { TransactionsProductsController } from './products/transactionsproducts.controller';
import { TransactionsProducts, TransactionsProductsSchema } from './products/schema/transactionsproducts.schema';
@Module({

    imports: [
        UtilsModule,SettingsModule,MethodepaymentsModule,BanksModule,OyPgModule,UserbasicnewModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: TransactionsCategorys.name, schema: TransactionsCategorysSchema },
            { name: TransactionsCoa.name, schema: TransactionsCoaSchema }, 
            { name: Balanceds.name, schema: BalancedsSchema },
            { name: TransactionsProducts.name, schema: TransactionsProductsSchema },
            { name: transactionsV2.name, schema: transactionsV2Schema }
        ], 'SERVER_FULL')
    ],
    controllers: [TransactionsV2Controller, TransactionsCategorysController, TransactionsCoaController, BalancedsController, TransactionsProductsController],
    providers: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, BalancedsService, TransactionsProductsService],
    exports: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, BalancedsService, TransactionsProductsService],
})
export class TransactionsV2Module { }
