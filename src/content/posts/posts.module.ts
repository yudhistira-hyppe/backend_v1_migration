import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Posts, PostsSchema } from './schemas/posts.schema';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
import { GetuserprofilesModule } from '../../trans/getuserprofiles/getuserprofiles.module';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { InterestsModule } from '../../infra/interests/interests.module';
import { MediavideosModule } from '../mediavideos/mediavideos.module';
import { InsightsModule } from '../insights/insights.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { PostContentService } from './postcontent.service';
import { MediadiariesModule } from '../mediadiaries/mediadiaries.module';
import { MediastoriesModule } from '../mediastories/mediastories.module';
import { MediapictsModule } from '../mediapicts/mediapicts.module';
import { MediaprofilepictsModule } from '../mediaprofilepicts/mediaprofilepicts.module';
import { UserplaylistModule } from '../../trans/userplaylist/userplaylist.module';
import { PostPlayModule } from '../postplaylist/postplaylist.module';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';
import { BullModule } from '@nestjs/bull';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PostContentPlaylistService } from './postcontentplaylist.service';
import { TemplatesRepoModule } from '../../infra/templates_repo/templates_repo.module';
import { PostCommentService } from './postcomment.service';
import { DisqusModule } from '../disqus/disqus.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { SettingsModule } from '../../trans/settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InsightlogsModule } from '../insightlogs/insightlogs.module';
import { ContentModService } from './contentmod.service';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { MethodepaymentsModule } from '../../trans/methodepayments/methodepayments.module';
import { SocketModule } from '../socket/socket.module';
import { PostBoostService } from './postboost.service';
import { MediamusicModule } from '../mediamusic/mediamusic.module';
import { TransactionsPostModule } from '../../trans/transactionpost/transactionspost.module';
import { AdsLandingModule } from './adslanding/adslanding.module';
import { TagCountModule } from '../tag_count/tag_count.module';
import { InterestCountModule } from '../interest_count/interest_count.module';
import { InterestdayModule } from '../interestday/interestday.module';
import { OssContentPictService } from './osscontentpict.service';
import { UserchallengesModule } from 'src/trans/userchallenges/userchallenges.module';
import { ChallengeModule } from 'src/trans/challenge/challenge.module';
import { PostchallengeModule } from 'src/trans/postchallenge/postchallenge.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { MediastikerModule } from '../mediastiker/mediastiker.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { NewpostModule } from '../disqus/newpost/newpost.module';
import { NewPost2Module } from 'src/content/new_post2/new_post2.module';
import { LogMigrationsModule } from 'src/trans/logmigrations/logmigrations.module';
import { PosttaskModule } from '../../content/posttask/posttask.module';
@Module({

    imports: [
        PosttaskModule,
        LogMigrationsModule,
        NewPost2Module,
        UserbasicnewModule,
        MediastikerModule,
        LogapisModule,
        PostchallengeModule,
        UserchallengesModule,
        ChallengeModule,
        InterestCountModule,
        InterestdayModule,
        AdsLandingModule,
        TransactionsPostModule,
        MediamusicModule,
        MethodepaymentsModule,
        OyPgModule,
        TagCountModule,
        BullModule.registerQueue({
            name: 'post-user-playlist',
        }),
        NestjsFormDataModule,
        SeaweedfsModule,
        UserplaylistModule,
        UtilsModule,
        ConfigModule.forRoot(), UserauthsModule, GetuserprofilesModule, UserbasicsModule, UtilsModule, InterestsModule,
        UserauthsModule, MediavideosModule, InsightsModule, ContenteventsModule, MediadiariesModule, MediastoriesModule,
        MediapictsModule, MediadiariesModule, MediaprofilepictsModule, PostPlayModule, TemplatesRepoModule, DisqusModule
        , DisquslogsModule, SettingsModule, NotificationsModule, InsightlogsModule, SocketModule, NewpostModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_FULL')
    ],
    controllers: [PostsController],
    providers: [PostsService, PostContentService, PostContentPlaylistService, PostCommentService, ContentModService, PostBoostService, OssContentPictService],
    exports: [PostsService, PostContentService, PostContentPlaylistService, PostCommentService, ContentModService, PostBoostService, OssContentPictService],
})
export class PostsModule { }
