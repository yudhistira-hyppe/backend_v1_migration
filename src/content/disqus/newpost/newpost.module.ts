import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Newpost, NewpostSchema } from '..//../disqus/newpost/schemas/newpost.schema';
import { tempposts2, temppostsSchema } from './schemas/temppost.schema';
import { NewpostController } from './newpost.controller';
import { NewpostService } from './newpost.service';
import { UtilsModule } from '../../../utils/utils.module';
import { SeaweedfsModule } from '../../../stream/seaweedfs/seaweedfs.module';
import { temppostDISCUSS } from './temppost.service';
@Module({

    imports: [
        ConfigModule.forRoot(),UtilsModule,SeaweedfsModule,
        MongooseModule.forFeature([{ name: Newpost.name, schema: NewpostSchema }, { name: tempposts2.name, schema: temppostsSchema }], 'SERVER_FULL')
    ],
    controllers: [NewpostController],
    providers: [NewpostService, temppostDISCUSS],
    exports: [NewpostService, temppostDISCUSS],
})
export class NewpostModule { }
