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
import { MonetizationService } from './monetization/monetization.service';
import { Monetize, monetizeSchema } from 'src/trans/monetization/schemas/monetization.schema';
import { CloudStreamingModule } from 'src/stream/tencent/cloudstreaming.module';

@Module({
    imports: [
        TransactionsV2Module,
        UserbasicnewModule,
        HttpModule,
        SocketModule,
        UserauthsModule,
        UserbasicsModule,
        UtilsModule,
        CloudStreamingModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: Mediastreaming.name, schema: MediastreamingSchema }, 
            { name: Mediastreamingrequest.name, schema: MediastreamingrequestSchema },
            { name: Monetize.name, schema: monetizeSchema }
        ], 'SERVER_FULL')
    ],
    controllers: [MediastreamingController],
    providers: [MediastreamingService, MediastreamingalicloudService, MediastreamingrequestService, MediastreamingAgoraService, MonetizationService],
    exports: [MediastreamingService, MediastreamingalicloudService, MediastreamingrequestService, MediastreamingAgoraService, MonetizationService],
})
export class MediastreamingModule { }
