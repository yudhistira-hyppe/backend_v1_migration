import {
    Controller,
    Post,
    Body,
    UseGuards,
    Res,
    HttpStatus,
  } from '@nestjs/common';
import { PushPlaybackLiveDto } from './dtos/push-live.dto';
import { CloudStreamingService } from './cloudstreming.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

  @Controller('api/tencent')
  export class CloudStreamingController {
    constructor(
      private cloudStreamingService: CloudStreamingService
    ) {}

    @Post('/push-live')
    @UseGuards(JwtAuthGuard)
    createPushLiveUrl(@Body() body: PushPlaybackLiveDto, @Res() res: Response) {
      const streamName = body.streamName;

      const data = this.cloudStreamingService.createPushLiveUrl(streamName)

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: "url created",
        data,
      });
    }

    @Post('/playback-live')
    @UseGuards(JwtAuthGuard)
    createPlaybackLiveUrl(@Body() body: PushPlaybackLiveDto, @Res() res: Response){
      const streamName = body.streamName;

      const data = this.cloudStreamingService.createPlaybackLiveUrl(streamName);

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: "url created",
        data,
      });
    }
  }