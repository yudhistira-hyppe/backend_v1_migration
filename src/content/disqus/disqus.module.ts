import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisqusService } from './disqus.service';
import { DisqusController } from './disqus.controller';
import { ConfigModule } from '@nestjs/config';
import { Disqus, DisqusSchema } from './schemas/disqus.schema';
import { UtilsModule } from '../../utils/utils.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { DisquscontactsModule } from '../disquscontacts/disquscontacts.module';
import { PostDisqusModule } from './post/postdisqus.module';
import { InsightsModule } from '../insights/insights.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
import { SocketModule } from '../socket/socket.module';
import { ReactionsRepoModule } from '../../infra/reactions_repo/reactions_repo.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { UserbasicnewModule } from '../../trans/userbasicnew/userbasicnew.module';
// import { NewpostService } from './newpost/newpost.service';
import { NewpostModule } from './newpost/newpost.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionsV2Module } from 'src/trans/transactionsv2/transactionsv2.module';
@Module({

    imports: [
        TransactionsV2Module,
        NewpostModule,
        UserbasicnewModule,
        HttpModule,
        ReactionsRepoModule,
        ContenteventsModule,
        InsightsModule,
        PostDisqusModule,
        DisquscontactsModule,
        DisquslogsModule,
        NestjsFormDataModule,
        UserbasicsModule,
        UserauthsModule,
        UtilsModule,
        SocketModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }], 'SERVER_FULL'),

    ],
    controllers: [DisqusController],
    providers: [DisqusService],
    exports: [DisqusService],
})
export class DisqusModule { }
