import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { temppost, temppostSchema } from './schemas/temppost.schema';
import { TemppostController } from './temppost.controller';
import { TemppostService } from './temppost.service';

@Module({


  imports: [
   
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: temppost.name, schema: temppostSchema }], 'SERVER_FULL'),
    
  ],
  controllers: [TemppostController],
  providers: [TemppostService],
  exports: [TemppostService],
})
export class TemppostModule { }

