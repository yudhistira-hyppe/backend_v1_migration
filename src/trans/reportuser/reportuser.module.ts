import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportuserController } from './reportuser.controller';
import { ReportuserService } from './reportuser.service';
import { ConfigModule } from '@nestjs/config';
import { Reportuser, ReportuserSchema } from './schemas/reportuser.schema';
import { RemovedreasonsModule } from '../removedreasons/removedreasons.module';
import { ReportreasonsModule } from '../reportreasons/reportreasons.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { PostsModule } from '../../content/posts/posts.module';
import { AdsModule } from '../ads/ads.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { UserAdsModule } from '../userads/userads.module';
import { UtilsModule } from '../../utils/utils.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';
import { UserticketsModule } from '../usertickets/usertickets.module';
import { GetusercontentsModule } from '../getusercontents/getusercontents.module';
import { UserbankaccountsModule } from '../userbankaccounts/userbankaccounts.module';
import { SettingsModule } from '../settings/settings.module';
import { LogapisModule } from '../logapis/logapis.module';
import { NewPostModule } from 'src/content/new_post/new_post.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { AdsModule as AdsV2Module } from '../adsv2/ads/ads.module';
@Module({

    imports: [
        SettingsModule, GetusercontentsModule, UserbankaccountsModule, UserticketsModule, UtilsModule, UserbasicsModule, MediaprofilepictsModule, UserAdsModule, UserauthsModule, TransactionsModule, PostsModule, AdsModule, ReportreasonsModule, MediaproofpictsModule, RemovedreasonsModule, LogapisModule, ConfigModule.forRoot(), NewPostModule, UserbasicnewModule, AdsV2Module,
        MongooseModule.forFeature([{ name: Reportuser.name, schema: ReportuserSchema }], 'SERVER_FULL')
    ],
    controllers: [ReportuserController],
    providers: [ReportuserService],
    exports: [ReportuserService],
})
export class ReportuserModule { }
