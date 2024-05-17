import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NewPostService } from './new_post.service';
import { NewPostController } from './new_post.controller';
import { tempposts, temppostsSchema } from './schemas/tempPost.schema';
import { TempPOSTService } from './temp_post.service';
import { NewpostsSchema, newPosts } from './schemas/newPost.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { PostsModule } from '../posts/posts.module';
import { GetusercontentsModule } from 'src/trans/getusercontents/getusercontents.module';
import { MediamusicModule } from '../mediamusic/mediamusic.module';
import { SettingsModule } from 'src/trans/settings/settings.module';
import { MediastikerModule } from '../mediastiker/mediastiker.module';
import { NewPostContentService } from './new_postcontent.service';
import { InterestsModule } from 'src/infra/interests/interests.module';
import { TagCountModule } from '../tag_count/tag_count.module';
import { InsightsModule } from '../insights/insights.module';
import { MediavideosModule } from '../mediavideos/mediavideos.module';
import { MediastoriesModule } from '../mediastories/mediastories.module';
import { MediadiariesModule } from '../mediadiaries/mediadiaries.module';
import { MediapictsModule } from '../mediapicts/mediapicts.module';
import { TemplatesRepoModule } from 'src/infra/templates_repo/templates_repo.module';
import { TransactionsPostModule } from 'src/trans/transactionpost/transactionspost.module';
import { PostchallengeModule } from 'src/trans/postchallenge/postchallenge.module';
import { UserchallengesModule } from 'src/trans/userchallenges/userchallenges.module';
import { InterestCountModule } from '../interest_count/interest_count.module';
import { InterestdayModule } from '../interestday/interestday.module';
import { DisqusModule } from '../disqus/disqus.module';
import { NewPostModService } from './new_post_mod.service';
import { SocketModule } from '../socket/socket.module';
import { PosttaskModule } from '../../content/posttask/posttask.module';
import { ScheduleinjectModule } from '../../schedule/scheduleinject/scheduleinject.module';
import { TransactionsV2Module } from 'src/trans/transactionsv2/transactionsv2.module';
import { MonetizationModule } from 'src/trans/monetization/monetization.module';
import { BoostintervalModule } from '../boostinterval/boostinterval.module';
import { BoostsessionModule } from '../boostsession/boostsession.module';
@Module({
  imports: [
    ScheduleinjectModule,
    PosttaskModule,
    SocketModule,
    DisqusModule,
    DisquslogsModule,
    TransactionsPostModule,
    ConfigModule.forRoot(),
    MediastikerModule,
    InterestCountModule,
    InterestdayModule,
    UtilsModule,
    PostchallengeModule,
    UserchallengesModule,
    SettingsModule,
    ContenteventsModule,
    UserbasicnewModule,
    MediavideosModule,
    MediastoriesModule,
    MediadiariesModule,
    LogapisModule,
    InsightsModule,
    InterestsModule,
    TagCountModule,
    PostsModule,
    MediapictsModule,
    GetusercontentsModule,
    TemplatesRepoModule,
    DisquslogsModule,
    MediamusicModule,
    TransactionsV2Module,
    MonetizationModule,
    BoostintervalModule,
    BoostsessionModule,
    MongooseModule.forFeature([{ name: newPosts.name, schema: NewpostsSchema }, { name: tempposts.name, schema: temppostsSchema }], 'SERVER_FULL')
  ],
  controllers: [NewPostController],
  providers: [NewPostService, NewPostContentService, NewPostModService, TempPOSTService],
  exports: [NewPostService, NewPostContentService, NewPostModService, TempPOSTService]
})
export class NewPostModule { }
