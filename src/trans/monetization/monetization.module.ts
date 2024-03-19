import { Module } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';
import { transactionCoinController } from './transactionCoin/transactionCoin.controller';
import { transactionCoinService } from './transactionCoin/transactionCoin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { Monetize, monetizeSchema } from './schemas/monetization.schema';
import { transactionCoin, transactionCoinSchema } from './transactionCoin/schemas/transactionCoin.schema';
import { PostsModule } from 'src/content/posts/posts.module';
import { UtilsModule } from 'src/utils/utils.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { TemplatesRepoModule } from 'src/infra/templates_repo/templates_repo.module';

@Module({
  imports: [
    LogapisModule, PostsModule, UtilsModule, UserbasicnewModule, TemplatesRepoModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Monetize.name, schema: monetizeSchema },
      { name: transactionCoin.name, schema: transactionCoinSchema }
    ], 'SERVER_FULL')
  ],
  controllers: [MonetizationController, transactionCoinController],
  providers: [MonetizationService, transactionCoinService]
})
export class MonetizationModule { }
