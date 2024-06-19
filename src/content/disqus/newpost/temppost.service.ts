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

    async updateemail(id: string, email: string, iduser: {
        "$oid": string
    }, createdAt: string): Promise<Object> {
        let data = await this.PostsModel.updateOne({ "_id": id },
            {
                $set: {
                    "email": email, "userProfile": {
                        "$ref": "userbasics",
                        "$id": iduser,
                        "$db": "hyppe_trans_db"
                    },
                    "saleAmount": 0,
                    "comments": 0,
                    "certified": true,
                    "createdAt": createdAt,
                    "updatedAt": createdAt,
                    "metadata.email": email
                }
            });
        return data;
    }

    async updatePostviewer(postid: string, email: string) {
        return await this.PostsModel.updateOne({ postID: postid }, { $push: { viewer: email } }).exec();
    }

    async updateView(email: string, email_target: string, postID: string) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     views: 1
        // };
        // var setCEViewer = getdata.userView;
        // setCEViewer.push(email_target);
        // setinput["$set"] = {
        //     "userView": setCEViewer
        // }
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    views: 1
                },
                "$push":
                {
                    userView: email_target
                }
            },
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
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     views: 1
        // };
        // var setCEViewer = getdata.userView;
        // setCEViewer.push(email_target);
        // setinput["$set"] = {
        //     "userView": setCEViewer
        // }

        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    likes: 1
                },
                "$push":
                {
                    userLike: email_target
                }
            },
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

    async updateUnLike(email: string, email_target: string, postID: string, array: any[]) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     likes: -1
        // };
        // var setCELike = getdata.userLike;
        // var filterdata = setCELike.filter(emaildata => emaildata != email_target);
        // setinput["$set"] = {
        //     "userLike": filterdata
        // }

        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    likes: -1
                },
                "$set":
                {
                    userLike: array
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async update(id: string, update: tempposts2): Promise<tempposts2> {
        let data = await this.PostsModel.findByIdAndUpdate(id, update, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }
    async updateLike2( userlike: any[], postID: string) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            likes: 1
        };
       
        setinput["$set"] = {
            "userLike": userlike
        }
        
        this.PostsModel.updateOne(
            {
               
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
    async updateUnlikeLike2( userlike: any[], postID: string) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            likes: -1
        };
       
        setinput["$set"] = {
            "userLike": userlike
        }
        
        this.PostsModel.updateOne(
            {
               
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
    async updatesalelike(id: string): Promise<Object> {
        let data = await this.PostsModel.updateOne({ "_id": id },
            {
                $set: {
                    "salelike": false,
                    "saleAmount": 0
                }
            });
        return data;
    }

    async updatesaleview(id: string): Promise<Object> {
        let data = await this.PostsModel.updateOne({ "_id": id },
            {
                $set: {
                    "saleview": false,
                    "saleAmount": 0
                }
            });
        return data;
    }
   

    async updateView2( userView: any[], postID: string,viewer: any[]) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        setinput['$inc'] = {
            views: 1
        };
       
        setinput["$set"] = {
            "userView": userView,
            "viewer":viewer
        }
        
        this.PostsModel.updateOne(
            {
               
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

    async updateView3( postID: string,viewer: any[]) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        var setinput = {};
        // setinput['$inc'] = {
        //     views: 1
        // };
       
        setinput["$set"] = {
            
            "viewer":viewer
        }
        
        this.PostsModel.updateOne(
            {
               
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