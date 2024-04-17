import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';

import { Comment, CommentDocument } from '../comment/schemas/comment.schema';
import { PostsService } from '../../../content/posts/posts.service';
import { DisqusService } from '../../../content/disqus/disqus.service';
import { DisquslogsService } from '../../../content/disquslogs/disquslogs.service';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name, 'SERVER_FULL')
        private readonly commentModel: Model<CommentDocument>,
        private readonly postsService: PostsService,
        private readonly disqusService: DisqusService,
        private readonly disquslogsService: DisquslogsService,
    ) { }



    async findOne(email: string): Promise<Comment> {
        return this.commentModel.findOne({ receiver: email }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.commentModel.findByIdAndRemove({
            _id: id,
        }).exec();
        return deletedCat;
    }

    async update(
        id: string,
        createCommentDto: CreateCommentDto,
    ): Promise<Comment> {
        let data = await this.commentModel.findByIdAndUpdate(
            id,
            createCommentDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findlastcomment(email: string) {

        const query = await this.commentModel.aggregate([
            { $match: { receiver: email, active: true } },

            {
                $addFields: {
                    createdAt: '$createdAt',
                    disqusID: '$disqusID',
                    receiver: "$receiver",
                    sender: "$sender"

                },
            },
            {
                $lookup: {
                    from: 'disqus',
                    localField: 'disqusID',
                    foreignField: '_id',
                    as: 'disqus_data',
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    post: { $arrayElemAt: ['$postdata', 0] },
                    disqusdata: { $arrayElemAt: ['$disqus_data', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    email: "$disqusdata.email",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }



                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'receiver',
                    foreignField: 'email',
                    as: 'userbasics_data',
                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "sender",
                    foreignField: "email",
                    as: "userdatasender"
                }
            },

            {
                $project: {

                    user: { $arrayElemAt: ['$userbasics_data', 0] },
                    usersender: { $arrayElemAt: ['$userdatasender', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }




                }
            },

            {
                $project: {
                    // profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    disqus: "$disqus",




                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilePict_id',
                    foreignField: '_id',
                    as: 'profilePict_data',
                },
            },
            {
                $project: {
                    profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilpic: '$profilpict.id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    // avatar: {
                    //     mediaBasePath: '$profilpict.mediaBasePath',
                    //     mediaUri: '$profilpict.mediaUri',
                    //     mediaType: '$profilpict.mediaType',
                    //     mediaEndpoint: '$profilpict.fsTargetUri',
                    //     medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    // },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    },



                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
                },
            },
            {
                $project: {
                    picts: "$pict",
                    concats: "$concat",
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',


                    },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concats", "/", "$picts"] },

                    },



                }
            },
            { $sort: { createdAt: -1 }, },
            { $skip: 0 },
            { $limit: 10 },
        ]);

        return query;
    }

    async findlastcommentv2(email: string) {

        const query = await this.commentModel.aggregate([
            { $match: { receiver: email, active: true } },

            {
                $addFields: {
                    createdAt: '$createdAt',
                    disqusID: '$disqusID',
                    receiver: "$receiver",
                    sender: "$sender"

                },
            },
            {
                $lookup: {
                    from: 'disqus',
                    localField: 'disqusID',
                    foreignField: '_id',
                    as: 'disqus_data',
                },
            },
            {
                $lookup: {
                    from: "newPosts",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    post: { $arrayElemAt: ['$postdata', 0] },
                    disqusdata: { $arrayElemAt: ['$disqus_data', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    // postType: "$postType",
                    postType: {
                        '$cond': {
                            if: {
                                "$eq": ["$postType", "diary"]
                            },
                            then: "vid",
                            else: "$postType"
                        }
                    },
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    email: "$disqusdata.email",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }



                }
            },
            {
                $lookup: {
                    from: 'newUserBasics',
                    localField: 'receiver',
                    foreignField: 'email',
                    as: 'userbasics_data',
                },
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "sender",
                    foreignField: "email",
                    as: "userdatasender"
                }
            },

            {
                $project: {

                    user: { $arrayElemAt: ['$userbasics_data', 0] },
                    usersender: { $arrayElemAt: ['$userdatasender', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }




                }
            },

            {
                $project: {
                    // profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    disqus: "$disqus",




                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilePict_id',
                    foreignField: '_id',
                    as: 'profilePict_data',
                },
            },
            {
                $project: {
                    profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilpic: '$profilpict.id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    // avatar: {
                    //     mediaBasePath: '$profilpict.mediaBasePath',
                    //     mediaUri: '$profilpict.mediaUri',
                    //     mediaType: '$profilpict.mediaType',
                    //     mediaEndpoint: '$profilpict.fsTargetUri',
                    //     medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    // },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    },



                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
                },
            },
            {
                $project: {
                    picts: "$pict",
                    concats: "$concat",
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',


                    },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concats", "/", "$picts"] },

                    },



                }
            },
            { $sort: { createdAt: -1 }, },
            { $skip: 0 },
            { $limit: 10 },
        ]);

        return query;
    }

    async findcomment(postID: string) {

        const query = await this.commentModel.aggregate([
            { $match: { postID: postID } },

            {
                $addFields: {
                    createdAt: '$createdAt',
                    disqusID: '$disqusID',
                    receiver: "$receiver",
                    sender: "$sender"

                },
            },
            {
                $lookup: {
                    from: 'disqus',
                    localField: 'disqusID',
                    foreignField: '_id',
                    as: 'disqus_data',
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    post: { $arrayElemAt: ['$postdata', 0] },
                    disqusdata: { $arrayElemAt: ['$disqus_data', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    email: "$disqusdata.email",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }



                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'receiver',
                    foreignField: 'email',
                    as: 'userbasics_data',
                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "sender",
                    foreignField: "email",
                    as: "userdatasender"
                }
            },

            {
                $project: {

                    user: { $arrayElemAt: ['$userbasics_data', 0] },
                    usersender: { $arrayElemAt: ['$userdatasender', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }




                }
            },

            {
                $project: {
                    // profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    disqus: "$disqus",




                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilePict_id',
                    foreignField: '_id',
                    as: 'profilePict_data',
                },
            },
            {
                $project: {
                    profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilpic: '$profilpict.id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    // avatar: {
                    //     mediaBasePath: '$profilpict.mediaBasePath',
                    //     mediaUri: '$profilpict.mediaUri',
                    //     mediaType: '$profilpict.mediaType',
                    //     mediaEndpoint: '$profilpict.fsTargetUri',
                    //     medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    // },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    },



                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
                },
            },
            {
                $project: {
                    picts: "$pict",
                    concats: "$concat",
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',


                    },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concats", "/", "$picts"] },

                    },



                }
            },
            { $sort: { createdAt: -1 }, },
            { $skip: 0 },
            { $limit: 10 },

        ]);
        return query;
    }

    async findcommentv2(postID: string) {

        const query = await this.commentModel.aggregate([
            { $match: { postID: postID } },

            {
                $addFields: {
                    createdAt: '$createdAt',
                    disqusID: '$disqusID',
                    receiver: "$receiver",
                    sender: "$sender"

                },
            },
            {
                $lookup: {
                    from: 'disqus',
                    localField: 'disqusID',
                    foreignField: '_id',
                    as: 'disqus_data',
                },
            },
            {
                $lookup: {
                    from: "newPosts",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    post: { $arrayElemAt: ['$postdata', 0] },
                    disqusdata: { $arrayElemAt: ['$disqus_data', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    email: "$disqusdata.email",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }



                }
            },
            {
                $lookup: {
                    from: 'newUserBasics',
                    localField: 'receiver',
                    foreignField: 'email',
                    as: 'userbasics_data',
                },
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "sender",
                    foreignField: "email",
                    as: "userdatasender"
                }
            },

            {
                $project: {

                    user: { $arrayElemAt: ['$userbasics_data', 0] },
                    usersender: { $arrayElemAt: ['$userdatasender', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }




                }
            },

            {
                $project: {
                    // profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilePict_id: '$usersender.profilePict.$id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    disqus: "$disqus",




                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilePict_id',
                    foreignField: '_id',
                    as: 'profilePict_data',
                },
            },
            {
                $project: {
                    profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                    profilpic: '$profilpict.id',
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    // avatar: {
                    //     mediaBasePath: '$profilpict.mediaBasePath',
                    //     mediaUri: '$profilpict.mediaUri',
                    //     mediaType: '$profilpict.mediaType',
                    //     mediaEndpoint: '$profilpict.fsTargetUri',
                    //     medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    // },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    },



                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
                },
            },
            {
                $project: {
                    picts: "$pict",
                    concats: "$concat",
                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',


                    },



                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$namesender",
                    namereceiver: "$namereceiver",
                    disqus: "$disqus",
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concats", "/", "$picts"] },

                    },



                }
            },
            { $sort: { createdAt: -1 }, },
            { $skip: 0 },
            { $limit: 10 },

        ]);
        return query;
    }
}
