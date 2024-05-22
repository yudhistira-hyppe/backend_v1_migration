import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PostContentService } from "src/content/posts/postcontent.service";
import { AdsService } from "src/trans/adsv2/ads/ads.service";
import { ChallengeService } from "src/trans/challenge/challenge.service";
import { TransactionsService } from "src/trans/transactions/transactions.service";
import { NewPostService } from 'src/content/new_post/new_post.service';
import { PosttaskService } from '../../content/posttask/posttask.service';
import { UserbasicnewService } from "src/trans/userbasicnew/userbasicnew.service";
import { MediastreamingService } from "src/content/mediastreaming/mediastreaming.service";
@Injectable()
export class TaskService {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly transactionsService: TransactionsService,
    private readonly adsService: AdsService,
    private readonly NewPostService: NewPostService,
    private readonly mediastreamingService: MediastreamingService,
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
  // @Cron('5 * * * * *')
  @Cron('0 */1 * * * *')
  ceckUserStream() {
    this.logger.debug('----------STREAM JOB START----------', new Date());
    this.mediastreamingService.refreshUserWarning();
  }
}
