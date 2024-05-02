
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Monetizenew, monetizenewSchema } from './schemas/monetizenew.schema';
import { MonetizenewController } from './monetizenew.controller';
import { MonetizenewService } from './monetizenew.service';
import { UtilsModule } from 'src/utils/utils.module';


@Module({
  imports: [
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Monetizenew.name, schema: monetizenewSchema }], 'SERVER_FULL')
  ],
  controllers: [MonetizenewController],
  providers: [MonetizenewService],
  exports: [MonetizenewService],
})
export class MonetizenewModule { }