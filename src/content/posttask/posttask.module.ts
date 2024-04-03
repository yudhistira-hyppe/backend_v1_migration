import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Posttask, PosttaskSchema } from './schemas/posttask.schema';
import { PosttaskController } from './posttask.controller';
import { PosttaskService } from './posttask.service';



@Module({


  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Posttask.name, schema: PosttaskSchema }], 'SERVER_FULL_CRON'),
    
  ],
  controllers: [PosttaskController],
  providers: [PosttaskService],
  exports: [PosttaskService],
})
export class PosttaskModule { }

