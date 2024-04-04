import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UtilsModule } from '../../utils/utils.module';
import { SeaweedfsModule } from '../seaweedfs/seaweedfs.module';
import { AwsModule } from '../aws/aws.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';
import { SettingsModule } from '../../trans/settings/settings.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
import { ContenteventsModule } from "../../content/contentevents/contentevents.module";
import { OssModule } from '../oss/oss.module';
import { FriendListModule } from "../../content/friend_list/friend_list.module";
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { ReferralModule } from 'src/trans/referral/referral.module';
import { InsightsModule } from 'src/content/insights/insights.module';
import { ChallengeModule } from 'src/trans/challenge/challenge.module';
import { UserchallengesModule } from 'src/trans/userchallenges/userchallenges.module';
@Module({
  imports: [
    ChallengeModule,
    UserchallengesModule,
    InsightsModule,
    ReferralModule,
    OssModule,
    FriendListModule,
    UserauthsModule,
    MediaprofilepictsModule,
    SettingsModule,
    MediaproofpictsModule,
    UserbasicsModule,
    AwsModule,
    ContenteventsModule,
    SeaweedfsModule,
    UtilsModule,
    NestjsFormDataModule,
    ConfigService,
    ConfigModule.forRoot(),
    UserbasicnewModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule { }
