import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; './logmigrations.service';
import { ConfigModule } from '@nestjs/config';
import { LogMigrations, LogMigrationsSchema } from './schema/logmigrations.schema';
import { LogMigrationsService } from './logmigrations.service';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: LogMigrations.name, schema: LogMigrationsSchema }], 'SERVER_FULL')
    ],
    controllers: [],
    providers: [LogMigrationsService],
    exports: [LogMigrationsService],

})
export class LogMigrationsModule { }
