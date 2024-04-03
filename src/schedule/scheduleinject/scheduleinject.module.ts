import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Scheduleinject, ScheduleinjectSchema } from './schemas/scheduleinject.schema';
import { ScheduleinjectController } from './scheduleinject.controller';
import { ScheduleinjectService } from './scheduleinject.service';


@Module({


  imports: [
 
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Scheduleinject.name, schema: ScheduleinjectSchema }], 'SERVER_FULL_CRON')
  ],
  controllers: [ScheduleinjectController],
  providers: [ScheduleinjectService],
  exports: [ScheduleinjectService],
})
export class ScheduleinjectModule { }

