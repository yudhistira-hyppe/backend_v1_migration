import { Module } from '@nestjs/common';
import { PostsReadService } from './post_read.service';
import { PostsReadController } from './post_read.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsRead, PostsReadSchema } from './schema/post_read.schema';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { SettingsReadModule } from '../setting_read/setting_read.module';
import { PostsModule } from 'src/content/posts/posts.module';
import { ContenteventsModule } from 'src/content/contentevents/contentevents.module';
import { NotificationReadService } from './notification_read.service';
import { NotificationsRead, NotificationsReadSchema } from './schema/notifications_read.schema';
import { NewPostModule } from 'src/content/new_post/new_post.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        UserbasicnewModule, 
        SettingsReadModule,
        PostsModule,
        LogapisModule,
        ContenteventsModule,
        //NotificationReadModule,
        UtilsModule,
        NewPostModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: NotificationsRead.name, schema: NotificationsReadSchema },
            { name: PostsRead.name, schema: PostsReadSchema }
        ], 'SERVER_FULL')
    ],
    controllers: [PostsReadController],
    providers: [PostsReadService, NotificationReadService],
    exports: [PostsReadService, NotificationReadService],
})
export class PostsReadModule { }
