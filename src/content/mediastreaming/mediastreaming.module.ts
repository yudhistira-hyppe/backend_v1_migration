import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { Mediastreaming, MediastreamingSchema } from './schema/mediastreaming.schema';
import { MediastreamingService } from './mediastreaming.service';
import { MediastreamingController } from './mediastreaming.controller';
import { MediastreamingalicloudService } from './mediastreamingalicloud.service';
import { SocketModule } from '../socket/socket.module';
import { UserauthsModule } from 'src/trans/userauths/userauths.module';
import { Mediastreamingrequest, MediastreamingrequestSchema } from './schema/mediastreamingrequest.schema';
import { MediastreamingrequestService } from './mediastreamingrequest.service';
import { HttpModule } from '@nestjs/axios';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { MediastreamingAgoraService } from './mediastreamingagora.service';
import { TransactionsV2Module } from 'src/trans/transactionsv2/transactionsv2.module';
import { MonetizationModule } from 'src/trans/monetization/monetization.module';

@Module({
    imports: [
        MonetizationModule,
        TransactionsV2Module,
        UserbasicnewModule,
        HttpModule,
        SocketModule,
        UserauthsModule,
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediastreaming.name, schema: MediastreamingSchema }, { name: Mediastreamingrequest.name, schema: MediastreamingrequestSchema }], 'SERVER_FULL')
    ],
    controllers: [MediastreamingController],
    providers: [MediastreamingService, MediastreamingalicloudService, MediastreamingrequestService, MediastreamingAgoraService],
    exports: [MediastreamingService, MediastreamingalicloudService, MediastreamingrequestService, MediastreamingAgoraService],
})
export class MediastreamingModule { }
