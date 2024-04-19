import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Dummyuser, DummyuserSchema } from './schemas/dummyuser.schema';
import { DummyuserController } from './dummyuser.controller';
import { DummyuserService } from './dummyuser.service';
import { UtilsModule } from '../../utils/utils.module';

@Module({


  imports: [
    UtilsModule, 
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Dummyuser.name, schema: DummyuserSchema }], 'SERVER_FULL_CRON')
  ],
  controllers: [DummyuserController],
  providers: [DummyuserService],
  exports: [DummyuserService],
})
export class DummyuserModule { }

