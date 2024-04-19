import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tempposts2, temppostsDocument } from './schemas/temppost.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { SeaweedfsService } from 'src/stream/seaweedfs/seaweedfs.service';
@Injectable()
export class temppostDISCUSS {
    private readonly logger = new Logger(temppostDISCUSS.name);
    constructor(
        @InjectModel(tempposts2.name, 'SERVER_FULL')
        private readonly PostsModel: Model<temppostsDocument>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,
        private readonly seaweedfsService: SeaweedfsService,
    ) { }

    async findByPostId(postID: string): Promise<tempposts2> {
        return this.PostsModel.findOne({ postID: postID }).exec();
    }

    async updatePostviewer(postid: string, email: string) {
        return await this.PostsModel.updateOne({ postID: postid }, { $push: { viewer: email } }).exec();
    }

    async updateView(email: string, email_target: string, postID: string) {
        var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            views: 1
        };
        var setCEViewer = getdata.userView;
        setCEViewer.push(email_target);
        setinput["$set"] = {
            "userView": setCEViewer
        }

        this.PostsModel.updateOne(
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
        var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            likes: 1
        };
        var setCELike = getdata.userLike;
        setCELike.push(email_target);
        setinput["$set"] = {
            "userLike": setCELike
        }

        this.PostsModel.updateOne(
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

    async updateReaction(email: string, postID: string) {
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { reactions: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateUnLike(email: string, email_target: string, postID: string) {
        var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            likes: -1
        };
        var setCELike = getdata.userLike;
        var filterdata = setCELike.filter(emaildata => emaildata != email_target);
        setinput["$set"] = {
            "userLike": filterdata
        }

        this.PostsModel.updateOne(
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