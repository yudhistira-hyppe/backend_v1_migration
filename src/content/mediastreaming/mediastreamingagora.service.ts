import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Mediastreaming, MediastreamingDocument } from './schema/mediastreaming.schema';
import { UtilsService } from 'src/utils/utils.service';
import { HttpService } from '@nestjs/axios';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import axios from 'axios';;

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

  async getChannelList() {
    //APP ID
    const ID_SETTING_APP_ID = this.configService.get("ID_SETTING_APP_ID");
    const GET_ID_SETTING_APP_ID = await this.utilsService.getSetting_Mixed(ID_SETTING_APP_ID);

    //CUSTOMER KEY
    const ID_SETTING_CUSTOMER_KEY = this.configService.get("ID_SETTING_CUSTOMER_KEY");
    const GET_ID_SETTING_CUSTOMER_KEY = await this.utilsService.getSetting_Mixed(ID_SETTING_CUSTOMER_KEY);

    //CUSTOMER SECRET
    const ID_SETTING_CUSTOMER_SECRET = this.configService.get("ID_SETTING_CUSTOMER_SECRET");
    const GET_ID_SETTING_CUSTOMER_SECRET = await this.utilsService.getSetting_Mixed(ID_SETTING_CUSTOMER_SECRET);

    //BASE URL
    const ID_SETTING_BASE_URL_AGORA = this.configService.get("ID_SETTING_BASE_URL_AGORA");
    const GET_ID_SETTING_BASE_URL_AGORA = await this.utilsService.getSetting_Mixed(ID_SETTING_BASE_URL_AGORA);

    const plainCredential = GET_ID_SETTING_CUSTOMER_KEY.toString() + ":" + GET_ID_SETTING_CUSTOMER_SECRET.toString();
    // ENCODE BASE64
    let encodedCredential = Buffer.from(plainCredential).toString('base64')
    let authorizationField = "Basic " + encodedCredential;
    //PATH CHANNEL
    let pathChannel = '/dev/v1/channel/';

    let data = '';
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://' + GET_ID_SETTING_BASE_URL_AGORA + pathChannel + GET_ID_SETTING_APP_ID+'/',
      headers: {
        'Authorization': authorizationField,
      },
      data: data
    };

    const getData = async () => {
      const response = await axios.request(config).then((response) => {
        //console.log(JSON.stringify(response.data));
        return response.data
      }).catch((error) => {
        //console.log(error);
        return null
      });
      return response;
    };
    return getData();

    // let response;
    // await axios.request(config).then((response) => {
    //     //console.log(JSON.stringify(response.data));
    //     response = response.data
    //   }).catch((error) => {
    //     //console.log(error);
    //     response = null
    //   });
    // return response;
  }
}
