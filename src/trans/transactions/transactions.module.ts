import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ConfigModule } from '@nestjs/config';
import { Transactions, TransactionsSchema } from './schemas/transactions.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { SettingsModule } from '../settings/settings.module';
import { MethodepaymentsModule } from '../methodepayments/methodepayments.module';
import { BanksModule } from '../banks/banks.module';
import { PostsModule } from '../../content/posts/posts.module';
import { Pph21sModule } from '../pph21s/pph21s.module';
import { AccountbalancesModule } from '../accountbalances/accountbalances.module';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { InsightsModule } from '../../content/insights/insights.module';
import { UserbankaccountsModule } from '../userbankaccounts/userbankaccounts.module';
import { WithdrawsModule } from '../withdraws/withdraws.module';
import { GetusercontentsModule } from '../getusercontents/getusercontents.module';
import { BoostintervalModule } from '../../content/boostinterval/boostinterval.module';
import { BoostsessionModule } from '../../content/boostsession/boostsession.module';
import { MediavideosModule } from '../../content/mediavideos/mediavideos.module';
import { MediapictsModule } from '../../content/mediapicts/mediapicts.module';
import { MediadiariesModule } from '../../content/mediadiaries/mediadiaries.module';
import { UservouchersModule } from '../uservouchers/uservouchers.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { UtilsModule } from '../../utils/utils.module';
import { MediastoriesModule } from '../../content/mediastories/mediastories.module';
import { LanguagesModule } from '../../infra/languages/languages.module';
import { AdsModule } from '../ads/ads.module';
import { HttpModule } from '@nestjs/axios';
import { AdsBalaceCreditModule } from '../adsv2/adsbalacecredit/adsbalacecredit.module';
import { VoucherpromoModule } from '../adsv2/voucherpromo/voucherpromo.module';
import { LogapisModule } from '../logapis/logapis.module';
import { AdsPriceCreditsModule } from '../adsv2/adspricecredits/adspricecredits.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { NewPostModule } from 'src/content/new_post/new_post.module';
import { MonetizenewModule } from 'src/trans/transactions/monetizenew/monetizenew.module';

@Module({

    imports: [
        MonetizenewModule,
        UserbasicnewModule,
        NewPostModule,
        LogapisModule,
        AdsPriceCreditsModule,
        VoucherpromoModule,
        AdsBalaceCreditModule,
        HttpModule,
        BoostintervalModule,
        BoostsessionModule,
        UtilsModule,
        ConfigModule.forRoot(), GetusercontentsModule, UserbasicsModule, SettingsModule, MethodepaymentsModule, BanksModule, PostsModule, Pph21sModule, AccountbalancesModule, OyPgModule,
        InsightsModule, UserbankaccountsModule, WithdrawsModule, MediavideosModule, MediapictsModule, MediadiariesModule, UservouchersModule, VouchersModule, MediastoriesModule, LanguagesModule,
        AdsModule,
        MongooseModule.forFeature([{ name: Transactions.name, schema: TransactionsSchema }], 'SERVER_FULL')
    ],
    controllers: [TransactionsController],
    exports: [TransactionsService],
    providers: [TransactionsService],

})
export class TransactionsModule { }
