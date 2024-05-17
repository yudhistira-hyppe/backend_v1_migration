
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from '../../utils/utils.module';
import { UserticketsModule } from '../../trans/usertickets/usertickets.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { PostsModule } from '../../content/posts/posts.module';
import { ChallengeModule } from 'src/trans/challenge/challenge.module';
import { TransactionsModule } from 'src/trans/transactions/transactions.module';
import { AdsModule } from 'src/trans/adsv2/ads/ads.module';
import { NewPostModule } from 'src/content/new_post/new_post.module';
import { PosttaskModule } from '../../content/posttask/posttask.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
@Module({
  imports: [
    UserbasicnewModule,
    PosttaskModule,
    NewPostModule,
      AdsModule,
      TransactionsModule,
      ChallengeModule,
      ScheduleModule.forRoot(),
    ],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
