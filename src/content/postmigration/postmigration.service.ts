import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Postmigration, PostmigrationDocument } from './schemas/postmigration.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';

@Injectable()
export class PostmigrationService {
    constructor(
        @InjectModel(Postmigration.name, 'SERVER_FULL')
        private readonly loaddata: Model<PostmigrationDocument>,
        private readonly errorHandler: ErrorHandler,

    ){ }

    async findByPostId(postID: string): Promise<Postmigration> {
        return this.loaddata.findOne({ postID: postID }).exec();
      }

    async updateByPostId(id:string, data:Postmigration)
    {
        let result = await this.loaddata.findByIdAndUpdate(
            id,
            data,
            { new: true },
        );
        
        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;        
    }

    async updateLikeRobot(postID: string,poinlike:number) {
        this.loaddata.updateOne(
          {
            postID: postID,
          },
          { $inc: { likes: poinlike } },
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              console.log(docs);
            }
          },
        );
      }

      
}
