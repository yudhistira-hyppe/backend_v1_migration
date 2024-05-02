import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Mediastreaming, MediastreamingDocument } from './schema/mediastreaming.schema';
import { MediastreamingDto, RequestSoctDto } from './dto/mediastreaming.dto';
import { UtilsService } from 'src/utils/utils.service';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';

@Injectable()
export class MediastreamingAgoraService {
  private readonly logger = new Logger(MediastreamingAgoraService.name);
  
  constructor(
    @InjectModel(Mediastreaming.name, 'SERVER_FULL')
    private readonly MediastreamingModel: Model<MediastreamingDocument>,
    private readonly utilsService: UtilsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(channelName: string, privilegeExpireTime: number) {
    //APP ID
    const ID_SETTING_APP_ID = this.configService.get("ID_SETTING_APP_ID");
    const GET_ID_SETTING_APP_ID = await this.utilsService.getSetting_Mixed(ID_SETTING_APP_ID);

    //PRIMARY CERTIFICATE
    const ID_SETTING_PRIMARY_CERTIFICATE_KEY = this.configService.get("ID_SETTING_PRIMARY_CERTIFICATE_KEY");
    const GET_ID_SETTING_PRIMARY_CERTIFICATE_KEY = await this.utilsService.getSetting_Mixed(ID_SETTING_PRIMARY_CERTIFICATE_KEY);
    try {
      const token = RtcTokenBuilder.buildTokenWithUid(GET_ID_SETTING_APP_ID.toString(), GET_ID_SETTING_PRIMARY_CERTIFICATE_KEY.toString(), channelName, 0, RtcRole.PUBLISHER, privilegeExpireTime);
      return {
        token: token,
        channel: channelName,
        appId: GET_ID_SETTING_APP_ID.toString()
      }
    } catch(e){

    }
  }
}
