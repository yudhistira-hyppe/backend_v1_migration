import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoostsessionService } from './boostsession.service';
import { BoostsessionController } from './boostsession.controller';
import { ConfigModule } from '@nestjs/config';
import { Boostsession, BoostsessionSchema } from './schemas/boostsession.schema';
import { BoostintervalModule } from '../boostinterval/boostinterval.module';
import { UtilsModule } from '../../utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({

    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Boostsession.name, schema: BoostsessionSchema }],'SERVER_FULL'),
        BoostintervalModule
    ],
    controllers: [BoostsessionController],
    providers: [BoostsessionService],
    exports: [BoostsessionService],

})
export class BoostsessionModule {}
