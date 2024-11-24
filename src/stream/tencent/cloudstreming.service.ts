import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class CloudStreamingService {
    constructor() {}

    createPushLiveUrl(streamName: string) {
        const domainName = process.env.CSS_PUSH_LIVE_DOMAIN;
        const appName = process.env.CSS_LIVE_APP_NAME;
        const tencentSecretKey = process.env.CSS_DOMAIN_AUTH_KEY;
        
        const hexExpirationTime = this.createHexExpirationTime();
        const inputString = tencentSecretKey + streamName + hexExpirationTime;
        const txSecret = this.createMd5TxSecret(inputString);
        const formatUrl = `${domainName}/${appName}/${streamName}?txSecret=${txSecret}&txTime=${hexExpirationTime}`

        const result = {
            rtmpUrl: `rtmp://${formatUrl}`,
            webrtcUrl: `webrtc://${formatUrl}`,
        }
    
        return result;
    }

    createPlaybackLiveUrl(streamName: string) {
        const domainName = process.env.CSS_PLAYBACK_LIVE_DOMAIN;
        const appName = process.env.CSS_LIVE_APP_NAME;
        const transcode = process.env.CSS_TRANSCODING_TEMPLATE;

        const formatUrl = `${domainName}/${appName}/${streamName}_${transcode}`

        const result = {
            rtmpUrl: `rtmp://${formatUrl}`,
            webrtcUrl: `webrtc://${formatUrl}`,
        }

        return result;
    }

    createMd5TxSecret(inputString: string) {
        const hash = crypto.createHash('md5');
        hash.update(inputString);
        return hash.digest('hex');
    }

    // ini gua kagak tau encoding defaultnya dia mau apa coba cek yang di line 131 itu dia mau pake default encoding.
    // di docsnya kagak ada ini dia mau default encodingnya apa. kalo ngikutin yang di docs dia error yang 131nya karena kagak ada dfault encoding
    // https://console.intl.cloud.tencent.com/api/explorer?Product=live&Version=2018-08-01&Action=DescribeLiveStreamOnlineList
    sha256(message: string, secret: string = "", encoding:crypto.BinaryToTextEncoding= "hex") {
        const hmac = crypto.createHmac("sha256", secret)
        return hmac.update(message).digest(encoding)
      }

    getHash(message: string, encoding: crypto.BinaryToTextEncoding = "hex") {
        const hash = crypto.createHash("sha256")
        return hash.update(message).digest(encoding)
    }

    createHexExpirationTime() {
        // create expiration datenya dulu
        const expirationDateUTC = new Date();
        expirationDateUTC.setDate(expirationDateUTC.getDate() + 1);

        // convert to indo time (UTC + 7) -> masih pertanyaan nih perlu di +7 apa kagak 
        const indoOffetInMs = 7 * 60 * 60 * 1000;
        const expirationDate = new Date(expirationDateUTC.getTime() + indoOffetInMs);

        // convert to UNIX timestamp
        const unixTimestampExpDateInSeconds = Math.floor(expirationDate.getTime() / 1000);
        
        // convert to hexadecimal
        return unixTimestampExpDateInSeconds.toString(16).toUpperCase();
    }

    getDate(timestamp: number) {
        const date = new Date(timestamp * 1000)
        const year = date.getUTCFullYear()
        const month = ("0" + (date.getUTCMonth() + 1)).slice(-2)
        const day = ("0" + date.getUTCDate()).slice(-2)
        return `${year}-${month}-${day}`
    }

    async describeLiveOnlineList() {
        const tencentcloud = require("tencentcloud-sdk-nodejs-intl-en");

        const LiveClient = tencentcloud.live.v20180801.Client;
        const models = tencentcloud.live.v20180801.Models;

        const Credential = tencentcloud.common.Credential;
        const ClientProfile = tencentcloud.common.ClientProfile;
        const HttpProfile = tencentcloud.common.HttpProfile;

        let cred = new Credential(process.env.CSS_SECRET_ID, process.env.CSS_SECRET_KEY);
        let httpProfile = new HttpProfile();
        httpProfile.endpoint = "live.tencentcloudapi.com";
        let clientProfile = new ClientProfile();
        clientProfile.httpProfile = httpProfile;

        let client = new LiveClient(cred, "", clientProfile);
        let req = new models.DescribeLiveStreamOnlineListRequest();

        let params = {};
        req.from_json_string(JSON.stringify(params));

        // Return a promise that resolves with the response
        return new Promise<string>((resolve, reject) => {
            client.DescribeLiveStreamOnlineList(req, function(err, response) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response.to_json_string());
            });
        });
    }
}
