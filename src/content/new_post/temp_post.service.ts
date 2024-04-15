import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { tempposts, temppostsDocument } from './schemas/tempPost.schema';
import { PostContentService } from '../posts/postcontent.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateNewPostDTO, PostResponseApps, PostData, Avatar, Metadata, TagPeople, Cat, Privacy, GetcontenteventsDto } from './dto/create-newPost.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { GetusercontentsService } from 'src/trans/getusercontents/getusercontents.service';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { UserchallengesService } from 'src/trans/userchallenges/userchallenges.service';
import { Userchallenges } from 'src/trans/userchallenges/schemas/userchallenges.schema';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { pipeline } from 'stream';

@Injectable()
export class TempPOSTService {
  private readonly logger = new Logger(TempPOSTService.name);

  constructor(
    @InjectModel(tempposts.name, 'SERVER_FULL')
    private readonly loaddata: Model<temppostsDocument>,
    private readonly postContentService: PostContentService,
    private readonly utilService: UtilsService,
    private readonly logapiSS: LogapisService,
    private readonly errorHandler: ErrorHandler,
    private readonly basic2SS: UserbasicnewService,
    private readonly contentEventService: ContenteventsService,
    private readonly musicSS: MediamusicService,
    private readonly loadApsara: GetusercontentsService,
    private readonly postchallengeService: PostchallengeService,
    private readonly userchallengesService: UserchallengesService,
    private readonly utilsService: UtilsService,
    private readonly disquslogsService: DisquslogsService,
    private readonly disqusService: DisqusService,
  ) { }

  async create(CreatePostsDto: tempposts): Promise<tempposts> {
    const createPostsDto = await this.loaddata.create(CreatePostsDto);
    return createPostsDto;
  }

  async duplicatedata(CreatePostsDto: tempposts, id: string, target:string) {
    let result = null;    
    if(target == 'create')
    {
        result = await this.loaddata.create(CreatePostsDto);
    }
    else
    {
        let result = await this.loaddata.findByIdAndUpdate(id, CreatePostsDto, { new: true });

        if (!result) {
        throw new Error('Data is not found!');
        }
    }
  }

  async findByPostId(postID: string): Promise<tempposts> {
    return this.loaddata.findOne({ postID: postID }).exec();
  }
}