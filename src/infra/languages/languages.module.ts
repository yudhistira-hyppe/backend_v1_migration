import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { ConfigModule } from '@nestjs/config';
import { Languages, LanguagesSchema } from './schemas/languages.schema';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({
  imports: [
    LogapisModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Languages.name, schema: LanguagesSchema }], 'SERVER_FULL')
  ],
  controllers: [LanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule { }
