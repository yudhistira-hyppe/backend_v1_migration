import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Posttask, PosttaskSchema } from './schemas/posttask.schema';
import { PosttaskController } from './posttask.controller';
import { PosttaskService } from './posttask.service';
import { UtilsModule } from '../../utils/utils.module';
import { ScheduleinjectModule } from '../../schedule/scheduleinject/scheduleinject.module';
import { DummyuserModule } from '../../trans/dummyuser/dummyuser.module';
import { HistoryuserModule } from '../../content/historyuser/historyuser.module';
import { NewpostModule } from '../../content/disqus/newpost/newpost.module';
import { ContenteventsModule } from '../../content/contentevents/contentevents.module';
import { InsightsModule } from '../insights/insights.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { InsightlogsModule } from '../insightlogs/insightlogs.module';
import { HttpModule } from '@nestjs/axios';
import { TemppostModule } from '../temppost/temppost.module';
@Module({


  imports: [
    UtilsModule, ScheduleinjectModule,DummyuserModule,HistoryuserModule,NewpostModule,ContenteventsModule,InsightsModule,UserbasicnewModule,InsightlogsModule,HttpModule,TemppostModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Posttask.name, schema: PosttaskSchema }], 'SERVER_FULL_CRON'),
    
  ],
  controllers: [PosttaskController],
  providers: [PosttaskService],
  exports: [PosttaskService],
})
export class PosttaskModule { }

