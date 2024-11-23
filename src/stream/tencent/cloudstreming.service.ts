
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

    // ini gua kagak tau encoding defaultnya dia mau apa coba cek yang di line 131 itu dia mau pake default encoding.
    // di docsnya kagak ada ini dia mau default encodingnya apa. kalo ngikutin yang di docs dia error yang 131nya karena kagak ada dfault encoding
    // https://console.intl.cloud.tencent.com/api/explorer?Product=live&Version=2018-08-01&Action=DescribeLiveStreamOnlineList
    sha256(message: string, secret: string = "", encoding: crypto.BinaryToTextEncoding = "hex") {
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

    async describeLiveOnlineList(pageNum: number, pageSize: number) {
        try {
            const secretId = process.env.CSS_SECRET_ID
            const secretKey = process.env.CSS_SECRET_KEY
            const token = ""
            const region = ""
            const host = process.env.CSS_HOST
            const service = "live"
            const action = "DescribeLiveStreamOnlineList"
            const version = "2018-08-01"
            const timestamp = parseInt(String(new Date().getTime() / 1000))
            const date = this.getDate(timestamp)
            const domainName = process.env.CSS_PUSH_LIVE_DOMAIN
            const appName = process.env.CSS_LIVE_APP_NAME
            const nonce = 10
            const payload = {
                "DomainName": domainName,
                "AppName": appName,
                "PageNum": pageNum,
                "PageSize": pageSize
            }

            const stringifyPayload = JSON.stringify(payload)

            // step 1 Concatenate the CanonicalRequest string
            const signedHeaders = "content-type;host"
            const hashedRequestPayload = this.getHash(stringifyPayload)
            const httpRequestMethod = "POST"
            const canonicalUri = "/"
            const canonicalQueryString = ""
            const canonicalHeaders =
            "content-type:application/json; charset=utf-8\n" + "host:" + host + "\n"

            const canonicalRequest =
            httpRequestMethod +
            "\n" +
            canonicalUri +
            "\n" +
            canonicalQueryString +
            "\n" +
            canonicalHeaders +
            "\n" +
            signedHeaders +
            "\n" +
            hashedRequestPayload

            // Step 2: Concatenate the string to sign
            const algorithm = "TC3-HMAC-SHA256"
            const hashedCanonicalRequest = this.getHash(canonicalRequest)
            const credentialScope = date + "/" + service + "/" + "tc3_request"
            const stringToSign =
            algorithm +
            "\n" +
            timestamp +
            "\n" +
            credentialScope +
            "\n" +
            hashedCanonicalRequest

            // Step 3: Calculate the Signature
            const kDate = this.sha256(date, "TC3" + secretKey)
            const kService = this.sha256(service, kDate)
            const kSigning = this.sha256("tc3_request", kService)
            const signature = this.sha256(stringToSign, kSigning, "hex")

            // Step 4: Concatenate the Authorization
            const authorization =
            algorithm +
            " " +
            "Credential=" +
            secretId +
            "/" +
            credentialScope +
            ", " +
            "SignedHeaders=" +
            signedHeaders +
            ", " +
            "Signature=" +
            signature

            // Step 5: build and send request
            const headers = {
                Authorization: authorization,
                "Content-Type": "application/json; charset=utf-8",
                Host: host,
                "X-TC-Action": action,
                "X-TC-Timestamp": timestamp,
                "X-TC-Version": version,
            }
            
            if (region) {
                headers["X-TC-Region"] = region
            }
            if (token) {
                headers["X-TC-Token"] = token
            }

            // tinggal buat callnya
        } catch (error) {
            throw(error)
        }
    }
}
