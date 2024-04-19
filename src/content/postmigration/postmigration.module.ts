import { Module } from '@nestjs/common';
import { PostmigrationService } from './postmigration.service';
import { PostmigrationController } from './postmigration.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Postmigration, PostmigrationSchema } from './schemas/postmigration.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:Postmigration.name, schema:PostmigrationSchema }], 'SERVER_FULL')
  ],
  controllers: [PostmigrationController],
  providers: [PostmigrationService],
  exports: [PostmigrationService]
})
export class PostmigrationModule {}
