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

@Module({

    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: TransactionsCategorys.name, schema: TransactionsCategorysSchema },
            { name: TransactionsCoa.name, schema: TransactionsCoaSchema }
        ], 'SERVER_FULL')
    ],
    controllers: [TransactionsV2Controller, TransactionsCategorysController, TransactionsCoaController],
    providers: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService],
    exports: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService],
})
export class TransactionsV2Module { }
