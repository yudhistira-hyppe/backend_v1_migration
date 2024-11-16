
import { Module } from '@nestjs/common';
import { CloudStreamingController } from './cloudstreaming.controller';
import { CloudStreamingService } from './cloudstreming.service';
@Module({
    controllers: [CloudStreamingController],
    providers: [CloudStreamingService],
    exports: [CloudStreamingService],
})
export class CloudStreamingModule {}
