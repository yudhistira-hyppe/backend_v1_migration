import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PostContentService } from "src/content/posts/postcontent.service";
import { AdsService } from "src/trans/adsv2/ads/ads.service";
import { ChallengeService } from "src/trans/challenge/challenge.service";
import { TransactionsService } from "src/trans/transactions/transactions.service";
import { NewPostService } from 'src/content/new_post/new_post.service';
import { PosttaskService } from '../../content/posttask/posttask.service';
@Injectable()
export class TaskService {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly transactionsService: TransactionsService,
    private readonly adsService: AdsService,
    private readonly NewPostService: NewPostService,
    private readonly PosttaskService: PosttaskService,
  ) { }


  private readonly logger = new Logger(TaskService.name);

  @Cron('0 */7 * * * *')
  challengeJob2() {
    this.logger.debug('----------CHALLEGE JOB START----------', new Date());
    this.challengeService.sendNotifeChallenge();
    this.challengeService.updateBadgeex();
    this.challengeService.updateSubchallengeex();
  }

  @Cron('0 */10 * * * *')
  ceckStatus() {
    this.logger.debug('----------DISBURSEMENT JOB START----------');
    //this.transactionsService.ceckStatusDisbursement();
  }

  @Cron('0 0 0 * * *')
  ceckADS() {
    this.logger.debug('----------ADS JOB START----------', new Date());
    this.adsService.ceckAdsActive();
  }

  // @Cron('0 */20 * * * *')
  // inject() {

  //   this.logger.debug('cron JOB START Like View');
  //   this.PosttaskService.runCronTask();
    
  // }

  // @Cron('1 0 0 * * *')
  // inject2() {

  //   this.logger.debug('cron JOB START schedule');
  //   this.PosttaskService.runCronSchedule();
    
  // }

  // @Cron('0 */5 * * * *')
  // inject3() {

  //     this.logger.debug('cron JOB START Fcm');
  //     this.PosttaskService.requestFcm();
    
  // }
}
