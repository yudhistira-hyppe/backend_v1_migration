
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

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
}
