import { Module } from '@nestjs/common';
import { transactionCoin3Service } from './transactionCoin.service';
import { transactionCoin3Controller } from './transactionCoin.controller';
//import { MonetizationModule } from '../monetization/monetization.module';
import { UtilsModule } from 'src/utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { transactionCoin3, transactionCoin3Schema } from './schemas/transactionCoin.schema';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
  imports:[
    UserbasicnewModule,
    //MonetizationModule,
    UtilsModule,
    LogapisModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: transactionCoin3.name, schema: transactionCoin3Schema }], 'SERVER_FULL')
  ],
  controllers: [transactionCoin3Controller],
  providers: [transactionCoin3Service]
})
export class transactionCoin2Module {}
