import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Historyuser, HistoryuserSchema } from './schemas/historyuser.schema';
import { HistoryuserController } from './historyuser.controller';
import { HistoryuserService } from './historyuser.service';
import { UtilsModule } from '../../utils/utils.module';

@Module({


  imports: [
    UtilsModule, 
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Historyuser.name, schema: HistoryuserSchema }], 'SERVER_FULL_CRON')
  ],
  controllers: [HistoryuserController],
  providers: [HistoryuserService],
  exports: [HistoryuserService],
})
export class HistoryuserModule { }

