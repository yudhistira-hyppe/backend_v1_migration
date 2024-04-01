import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicsController } from './userbasics.controller';
import { UserbasicsService } from './userbasics.service';
import { ConfigModule } from '@nestjs/config';
import { Userbasic, UserbasicSchema } from './schemas/userbasic.schema';
import { LanguagesModule } from '../../infra/languages/languages.module';
import { CountriesModule } from '../../infra/countries/countries.module';
import { InterestsRepoModule } from '../../infra/interests_repo/interests_repo.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { FriendListModule } from 'src/content/friend_list/friend_list.module';
import { LogapisModule } from '../logapis/logapis.module';
import { LogMigrationsModule } from '../logmigrations/logmigrations.module';

@Module({

    imports: [
        LogMigrationsModule,
        MediaprofilepictsModule,
        MediaproofpictsModule,
        InterestsRepoModule,
        LanguagesModule,
        CountriesModule,
        FriendListModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userbasic.name, schema: UserbasicSchema }], 'SERVER_FULL')
    ],
    controllers: [UserbasicsController],
    exports: [UserbasicsService],
    providers: [UserbasicsService],
})
export class UserbasicsModule { }