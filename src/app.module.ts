import { AdslogsModule } from './trans/adsv2/adslog/adslogs.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserdevicesModule } from './trans/userdevices/userdevices.module';
import { UserbasicsModule } from './trans/userbasics/userbasics.module';
import { UserauthsModule } from './trans/userauths/userauths.module';
import { UserticketsModule } from './trans/usertickets/usertickets.module';
import { JwtrefreshtokenModule } from './trans/jwtrefreshtoken/jwtrefreshtoken.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnapshoteventsModule } from './trans/snapshotevents/snapshotevents.module';
import { SagasModule } from './trans/sagas/sagas.module';
import { AdrolesModule } from './trans/adroles/adroles.module';
import { AuthModule } from './auth/auth.module';
import { DomaineventsModule } from './trans/domainevents/domainevents.module';
import { ActivityeventsModule } from './trans/activityevents/activityevents.module';
import { OauthclientdetailsModule } from './trans/oauthclientdetails/oauthclientdetails.module';
import { AreasModule } from './infra/areas/areas.module';
import { CitiesModule } from './infra/cities/cities.module';
import { CountriesModule } from './infra/countries/countries.module';
import { DocumentsModule } from './infra/documents/documents.module';
import { CorevaluesModule } from './infra/corevalues/corevalues.module';
import { EulasModule } from './infra/eulas/eulas.module';
import { FsChunksModule } from './infra/fs.chunks/fs.chunks.module';
import { FsfilesModule } from './infra/fsfiles/fsfiles.module';
import { InterestsModule } from './infra/interests/interests.module';
import { InterestsRepoModule } from './infra/interests_repo/interests_repo.module';
import { LanguagesModule } from './infra/languages/languages.module';
import { ReactionsModule } from './infra/reactions/reactions.module';
import { ReactionsRepoModule } from './infra/reactions_repo/reactions_repo.module';
import { ReportsModule } from './infra/reports/reports.module';
import { TemplatesModule } from './infra/templates/templates.module';
import { TemplatesRepoModule } from './infra/templates_repo/templates_repo.module';
import { WelcomenotesModule } from './infra/welcomenotes/welcomenotes.module';
import { ContentdailyqueueModule } from './content/contentdailyqueue/contentdailyqueue.module';
import { ContenteventsModule } from './content/contentevents/contentevents.module';
import { ContentqmaticModule } from './content/contentqmatic/contentqmatic.module';
import { DisqusModule } from './content/disqus/disqus.module';
import { DisquscontactsModule } from './content/disquscontacts/disquscontacts.module';
import { DisquslogsModule } from './content/disquslogs/disquslogs.module';
import { InsightlogsModule } from './content/insightlogs/insightlogs.module';
import { InsightsModule } from './content/insights/insights.module';
import { MediadiariesModule } from './content/mediadiaries/mediadiaries.module';
import { MediapictsModule } from './content/mediapicts/mediapicts.module';
import { MediaprofilepictsModule } from './content/mediaprofilepicts/mediaprofilepicts.module';
import { MediaproofpictsModule } from './content/mediaproofpicts/mediaproofpicts.module';
import { MediastoriesModule } from './content/mediastories/mediastories.module';
import { MediavideosModule } from './content/mediavideos/mediavideos.module';
import { NotificationsModule } from './content/notifications/notifications.module';
import { PostsModule } from './content/posts/posts.module';
import { ProfileModule } from './trans/profile/profile.module';
import { GetuserprofilesModule } from './trans/getuserprofiles/getuserprofiles.module';
import { GetusercontentsModule } from './trans/getusercontents/getusercontents.module';
import { CommentModule } from './trans/getusercontents/comment/comment.module';
import { FaqsModule } from './trans/faqs/faqs.module';
import { AnnouncementsModule } from './trans/announcements/announcements.module';
//import { UtilsModule } from './utils/utils.module';
import { TransactionsModule } from './trans/transactions/transactions.module';
import { AccountbalancesModule } from './trans/accountbalances/accountbalances.module';
import { GetcontenteventsModule } from './trans/getusercontents/getcontentevents/getcontentevents.module';
import { UserticketdetailsModule } from './trans/usertickets/userticketdetails/userticketdetails.module';
import { FaqdetailsModule } from './trans/faqs/faqdetails/faqdetails.module';
import { UserbankaccountsModule } from './trans/userbankaccounts/userbankaccounts.module';
import { AwsModule } from './stream/aws/aws.module';
import { SeaweedfsModule } from './stream/seaweedfs/seaweedfs.module';
import { MediaModule } from './stream/media/media.module';
import { ScheduleEmailModule } from './schedule/scheduleemail/scheduleemail.module';
import { GroupModule } from './trans/usermanagement/group/group.module';
import { ModuleModule } from './trans/usermanagement/module/module.module';
import { GroupModuleModule } from './trans/usermanagement/groupmodule/groupmodule.module';
import { AdsplacesModule } from './trans/adsplaces/adsplaces.module';
import { VouchersModule } from './trans/vouchers/vouchers.module';
import { UservouchersModule } from './trans/uservouchers/uservouchers.module';
import { AdstypesModule } from './trans/adstypes/adstypes.module';
import { AdsModule } from './trans/ads/ads.module';
import { UserAdsModule } from './trans/userads/userads.module';
import { DivisionModule } from './trans/usermanagement/division/division.module';
import { AdsUserCompareModule } from './trans/ads/adsusercompare/adsusercompare.module';
import { LevelticketsModule } from './trans/leveltickets/leveltickets.module';
import { SourceticketsModule } from './trans/sourcetickets/sourcetickets.module';
import { CategoryticketsModule } from './trans/categorytickets/categorytickets.module';
import { UserplaylistModule } from './trans/userplaylist/userplaylist.module';
import { ScheduleUserPlaylistModule } from './schedule/userplaylist/scheduleuserplaylist.module';
// import { LogticketsModule } from './trans/logtickets/logtickets.module';
import { RemovedreasonsModule } from './trans/removedreasons/removedreasons.module';
import { ReportreasonsModule } from './trans/reportreasons/reportreasons.module';
import { ReportuserModule } from './trans/reportuser/reportuser.module';
import { BullModule } from '@nestjs/bull';
import { UserbasicsnewModule } from './trans/newuserbasic/userbasicsnew.module';
import { AppGateway } from './content/socket/socket.gateway';
import { PostDisqusModule } from './content/disqus/post/postdisqus.module';
import { BoostsessionModule } from './content/boostsession/boostsession.module';
import { BoostintervalModule } from './content/boostinterval/boostinterval.module';
import { SocketModule } from './content/socket/socket.module';
import { GenreModule } from './infra/genre/genre.module';
import { MoodModule } from './infra/mood/mood.module';
import { ThemeModule } from './infra/theme/theme.module';
import { MediamusicModule } from './content/mediamusic/mediamusic.module';
import { IntervalSessionModule } from './content/boostsession/intervarsession/intervarsession.module';
import { TransactionsPostModule } from './trans/transactionpost/transactionspost.module';
import { DisqusContentEventModule } from './content/contentevents/discus/disqusdisquscontentevent.module';
import { DeepArModule } from './trans/deepar/deepar.module';
import { AssetsFilterModule } from './assets/filter/assets-filter.module';
import { AdsLandingModule } from './content/posts/adslanding/adslanding.module';
import { OssModule } from './stream/oss/oss.module';
import { Settings2Module } from './trans/settings2/settings2.module';
import { JenischallengeModule } from './trans/jenischallenge/jenischallenge.module';
import { BadgeModule } from './trans/badge/badge.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './schedule/task/task.module';
import { AdsSettingModule } from './trans/adsv2/adssetting/adssetting.module';
import { AdsModule as Adsv2Module } from './trans/adsv2/ads/ads.module'
import { AdsTypesModule } from './trans/adsv2/adstype/adstype.module';
import { AdsObjectivitasModule } from './trans/adsv2/adsobjectivitas/adsobjectivitas.module';
import { VoucherpromoModule } from './trans/adsv2/voucherpromo/voucherpromo.module';

import { BannerModule } from './trans/banner/banner.module';
import { MediastikerModule } from './content/mediastiker/mediastiker.module';
import { StickerCategoryModule } from './trans/stickercategory/stickercategory.module';
import { AdsPriceCreditsModule } from './trans/adsv2/adspricecredits/adspricecredits.module';
import { NewPostModule } from './content/new_post/new_post.module';
import { UserbasicnewModule } from './trans/userbasicnew/userbasicnew.module';
import { AdsRewardsModule } from './trans/adsv2/adsrewards/adsrewards.module';
import { GetprofilecontenteventModule } from './utils/getprofilecontentevent/getprofilecontentevent.module';
import { TopupsModule } from './trans/topups/topups.module';
import { SettingsReadModule } from './readonly/setting_read/setting_read.module';
import { PostsReadModule } from './readonly/post_read/post_read.module';
import { ChallengeReadModule } from './readonly/challenge_read/challenge_read.module';
import { MediastreamingModule } from './content/mediastreaming/mediastreaming.module';
import { FiltercategoryModule } from './assets/filtercategory/filtercategory.module';
import { GuidelineModule } from './trans/guideline/guideline.module';
import { AppController } from './app.controller';
import { MonetizationModule } from './trans/monetization/monetization.module';
import { TransactionsV2Module } from './trans/transactionsv2/transactionsv2.module';
@Module({
  imports: [
    TransactionsV2Module,
    ChallengeReadModule,
    SettingsReadModule,
    PostsReadModule,
    TopupsModule,
    GetprofilecontenteventModule,
    AdsRewardsModule,
    UserbasicnewModule,
    BannerModule,
    MediastikerModule,
    AdsPriceCreditsModule,
    VoucherpromoModule,
    AdslogsModule,
    Adsv2Module,
    AdsModule,
    AdsTypesModule,
    AdsObjectivitasModule,
    AdsSettingModule,
    TaskModule,
    OssModule,
    AssetsFilterModule,
    DeepArModule,
    DisqusContentEventModule,
    IntervalSessionModule,
    MediamusicModule,
    ThemeModule,
    MoodModule,
    GenreModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      }),
      inject: [ConfigService],
    }),
    BoostsessionModule,
    BoostintervalModule,
    ScheduleUserPlaylistModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forRoot(process.env.SERVER_TRANS, {
    //   connectionName: 'SERVER_TRANS',
    // }),
    // MongooseModule.forRoot(process.env.SERVER_CONTENT, {
    //   connectionName: 'SERVER_CONTENT',
    // }),
    // MongooseModule.forRoot(process.env.SERVER_INFRA, {
    //   connectionName: 'SERVER_INFRA',
    // }),
    PostDisqusModule,
    MongooseModule.forRoot(process.env.SERVER_FULL, {
      connectionName: 'SERVER_FULL',
    }),
    MongooseModule.forRoot(process.env.SERVER_FULL_READ, {
      connectionName: 'SERVER_FULL_READ',
    }),
    UserplaylistModule,
    // LogticketsModule,
    // ReportreasonsModule,
    // RemovedreasonsModule,
    ReportuserModule,
    CategoryticketsModule,
    SourceticketsModule,
    LevelticketsModule,
    AdsUserCompareModule,
    // UservouchersModule,
    // VouchersModule,
    DivisionModule,
    // UserAdsModule,
    //AdsModule,
    // AdstypesModule,
    AdsplacesModule,
    GroupModule,
    ModuleModule,
    GroupModuleModule,
    ScheduleEmailModule,
    TransactionsPostModule,
    MediaModule,
    //SeaweedfsModule,
    AwsModule,
    // UserdevicesModule,
    // UserbasicsModule,
    // UserauthsModule,
    //CommentModule,
    // UserbankaccountsModule,
    FaqdetailsModule,
    AdsLandingModule,
    MediastreamingModule,
    UserticketdetailsModule,
    //UtilsModule,
    // GetcontenteventsModule,
    AccountbalancesModule,
    TransactionsModule,
    AnnouncementsModule,
    UserticketsModule,
    FaqsModule,
    GetusercontentsModule,
    GetuserprofilesModule,
    ProfileModule,
    PostsModule,
    NotificationsModule,
    MediavideosModule,
    MediastoriesModule,
    UserbasicsnewModule,
    // MediaproofpictsModule,
    MediaprofilepictsModule,
    MediapictsModule,
    MediadiariesModule,
    InsightsModule,
    InsightlogsModule,
    DisquslogsModule,
    DisquscontactsModule,
    DisqusModule,
    ContentqmaticModule,
    //ContenteventsModule,
    ContentdailyqueueModule,
    WelcomenotesModule,
    TemplatesRepoModule,
    TemplatesModule,
    ReportsModule,
    ReactionsRepoModule,
    ReactionsModule,
    // LanguagesModule,
    InterestsRepoModule,
    InterestsModule,
    FsfilesModule,
    FsChunksModule,
    EulasModule,
    CorevaluesModule,
    DocumentsModule,
    CountriesModule,
    CitiesModule,
    AreasModule,
    OauthclientdetailsModule,
    ActivityeventsModule,
    DomaineventsModule,
    JwtrefreshtokenModule,
    SnapshoteventsModule,
    SagasModule,
    AdrolesModule,
    AuthModule,
    SocketModule,
    Settings2Module,
    JenischallengeModule,
    BadgeModule,
    StickerCategoryModule,
    NewPostModule,
    FiltercategoryModule,
    GuidelineModule,
    MonetizationModule
    //  ChallengeModule
  ], providers: [],
})
export class AppModule { }
