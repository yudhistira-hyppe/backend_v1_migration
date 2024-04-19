import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { temppost, temppostDocument } from './schemas/temppost.schema';


@Injectable()
export class TemppostService {
  private readonly logger = new Logger(TemppostService.name);

  constructor(
    @InjectModel(temppost.name, 'SERVER_FULL')
    private readonly loaddata: Model<temppostDocument>,
   
  ) { }

  async updateView(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        views: 1
    };
    var setCEViewer = getdata.userView;
    setCEViewer.push(email_target);
    setinput["$set"] = {
        "userView": setCEViewer
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        },
    );
}

async updateLike(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        likes: 1
    };
    var setCELike = getdata.userLike;
    setCELike.push(email_target);
    setinput["$set"] = {
        "userLike": setCELike
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
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