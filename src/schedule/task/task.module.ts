
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ChallengeModule } from 'src/trans/challenge/challenge.module';
import { TransactionsModule } from 'src/trans/transactions/transactions.module';
import { AdsModule } from 'src/trans/adsv2/ads/ads.module';
import { NewPostModule } from 'src/content/new_post/new_post.module';
import { PosttaskModule } from '../../content/posttask/posttask.module';
import { MediastreamingModule } from 'src/content/mediastreaming/mediastreaming.module';
@Module({
  imports: [
    MediastreamingModule,
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
