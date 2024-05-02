import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Guideline, GuidelineDocument } from './schemas/guideline.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ModuleService } from '../usermanagement/module/module.service';
import { TemplatesRepoService } from 'src/infra/templates_repo/templates_repo.service';

@Injectable()
export class GuidelineService {
    constructor(
        @InjectModel(Guideline.name, 'SERVER_FULL')
        private readonly guidelineModel: Model<GuidelineDocument>,
        private readonly utilsService: UtilsService,
        private readonly moduleService: ModuleService,
        private readonly templateService: TemplatesRepoService
    ) { }

    private approverModule = "community_approval";

    async findById(id: string): Promise<Guideline> {
        return this.guidelineModel.findById(id);
    }
    async findByName(name: string): Promise<Guideline> {
        return this.guidelineModel.findOne({ name: name });
    }
    async create(CreateGuidelineDto: any, username: string): Promise<Guideline> {
        let data = await this.guidelineModel.create(CreateGuidelineDto);
        if (CreateGuidelineDto.status == "SUBMITTED") {
            let lookupData = await this.moduleService.listModuleGroupUsers(this.approverModule);
            // let lookupData = [{
            //     userdata: [
            //         {
            //             fullName: "Haris Dwi Prakoso",
            //             email: "harisdwi.prakoso@gmail.com"
            //         }
            //     ]
            // }]
            for (let user of lookupData[0].userdata) {
                this.sendRequestEmail(user.email, user.fullName, username, CreateGuidelineDto.name, CreateGuidelineDto.updatedAt, CreateGuidelineDto.remark, CreateGuidelineDto.redirectUrl);
            }
        };
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async delete(id: string): Promise<Guideline> {
        let data = await this.guidelineModel.findByIdAndUpdate(id, {
            isActive: false,
            updatedAt: await this.utilsService.getDateTimeString(),
            isDeleted: true
        }, { new: true });
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async update(id: string, CreateGuidelineDto: any, username: string): Promise<Guideline> {
        // let data_old = await this.guidelineModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        let data_old = await this.guidelineModel.findById(id);
        if (!data_old) throw new Error('Old todo is not found');
        else {
            CreateGuidelineDto.createdAt = data_old.createdAt;
            CreateGuidelineDto.createdBy = data_old.createdBy;
            CreateGuidelineDto.isActive = true;
            CreateGuidelineDto.approvedBy = null;
            let data
            if (data_old.status == "DRAFT") {
                if (CreateGuidelineDto.status == "SUBMITTED") {
                    CreateGuidelineDto.redirectUrl += id;
                    let lookupData = await this.moduleService.listModuleGroupUsers(this.approverModule);
                    // let lookupData = [{
                    //     userdata: [
                    //         {
                    //             fullName: "Haris Dwi Prakoso",
                    //             email: "harisdwi.prakoso@gmail.com"
                    //         },
                    //     ]
                    // }]
                    for (let user of lookupData[0].userdata) {
                        this.sendRequestEmail(user.email, user.fullName, username, data_old.name.toString(), CreateGuidelineDto.updatedAt, data_old.remark.toString(), CreateGuidelineDto.redirectUrl);
                    }
                };
                data = await this.guidelineModel.findByIdAndUpdate(id, CreateGuidelineDto, { new: true });
            } else if (data_old.status == "APPROVED") {
                CreateGuidelineDto.parentId = data_old._id;
                CreateGuidelineDto._id = new mongoose.Types.ObjectId();
                CreateGuidelineDto.isDeleted = false;
                data_old = await this.guidelineModel.findByIdAndUpdate(id, { childId: CreateGuidelineDto._id }, { new: true });
                data = await this.guidelineModel.create(CreateGuidelineDto);
                if (CreateGuidelineDto.status == "SUBMITTED") {
                    CreateGuidelineDto.redirectUrl += CreateGuidelineDto._id;
                    let lookupData = await this.moduleService.listModuleGroupUsers(this.approverModule);
                    for (let user of lookupData[0].userdata) {
                        this.sendRequestEmail(user.email, user.fullName, username, data_old.name.toString(), CreateGuidelineDto.updatedAt, data_old.remark.toString(), CreateGuidelineDto.redirectUrl);
                    }
                }
            } else {
                CreateGuidelineDto.parentId = data_old._id;
                CreateGuidelineDto._id = new mongoose.Types.ObjectId();
                CreateGuidelineDto.isDeleted = false;
                data_old = await this.guidelineModel.findByIdAndUpdate(id, { isActive: false, childId: CreateGuidelineDto._id }, { new: true });
                data = await this.guidelineModel.create(CreateGuidelineDto);
            }
            if (!data) throw new Error('Todo is not found');
            return data;
        }
    }
    async approve(id: string, approver: mongoose.Types.ObjectId): Promise<Guideline> {
        let now = await this.utilsService.getDateTimeString();
        let toApprove = await this.guidelineModel.findById(id);
        if (toApprove.status !== "APPROVED") {
            let data = await this.guidelineModel.findByIdAndUpdate(id,
                {
                    status: "APPROVED",
                    updatedAt: now,
                    approvedAt: now,
                    approvedBy: approver
                },
                { new: true }
            );
            if (toApprove.parentId && toApprove.parentId !== undefined) {
                await this.guidelineModel.findByIdAndUpdate(toApprove.parentId,
                    {
                        isActive: false,
                        updatedAt: now
                    })
            }
            if (!data) throw new Error('Todo is not found');
            return data;
        } else { throw new Error('Guideline is already approved'); }
    }
    async reject(id: string, rejecter: mongoose.Types.ObjectId): Promise<Guideline> {
        let now = await this.utilsService.getDateTimeString();
        let toReject = await this.guidelineModel.findById(id);
        if (toReject.status !== "REJECTED") {
            let data_old = await this.guidelineModel.findByIdAndUpdate(id,
                {
                    status: "REJECTED",
                    updatedAt: now,
                    rejectedAt: now,
                    rejectedBy: rejecter,
                    isActive: false
                },
                { new: true }
            );
            if (!data_old) throw new Error('Old todo is not found');
            let new_data = JSON.parse(JSON.stringify(data_old.toJSON()));
            new_data._id = new mongoose.Types.ObjectId();
            new_data.status = "DRAFT";
            new_data.isActive = true;
            new_data.isDeleted = false;
            let data = await this.guidelineModel.create(new_data);
            if (!data) throw new Error('Todo is not found');
            return data;
        } else { throw new Error('Guideline is already rejected'); }
    }
    async listAll(skip: number, limit: number, descending: boolean, language?: string, isActive?: boolean, name?: string, status?: string[]): Promise<any> {
        let order = descending ? -1 : 1;
        let pipeline = [];
        pipeline.push({
            "$sort":
            {
                'updatedAt': order,
                'isActive': order
            }
        });
        if (isActive !== undefined) {
            pipeline.push({
                "$match":
                {
                    'isActive': isActive
                }
            });
        }
        if (name && name !== undefined) {
            pipeline.push({
                "$match":
                {
                    'name': new RegExp(name, "i")
                }
            });
        }
        if (language && language == 'en') {
            pipeline.push({
                "$match":
                {
                    'value_en': {
                        $ne: null
                    }
                }
            });
        } else if (language && language == 'id') {
            pipeline.push({
                "$match":
                {
                    'value_id': {
                        $ne: null
                    }
                }
            });
        }
        if (status && status.length > 0) {
            pipeline.push({
                "$match":
                {
                    'status': {
                        $in: status
                    }
                }
            });
        }
        pipeline.push(
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creator'
                },
            },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'approvedBy',
                    foreignField: '_id',
                    as: 'approver'
                },
            },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'rejectedBy',
                    foreignField: '_id',
                    as: 'rejecter'
                },
            },
            // {
            //     "$lookup":
            //     {
            //         from: "guidelines",
            //         localField: 'parentId',
            //         foreignField: '_id',
            //         as: 'parent'
            //     }
            // },
            {
                "$lookup":
                {
                    from: "guidelines",
                    localField: 'childId',
                    foreignField: '_id',
                    as: 'child'
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    name: 1,
                    title_id: 1,
                    title_en: 1,
                    value_id: 1,
                    value_en: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isActive: 1,
                    status: 1,
                    approvedAt: 1,
                    rejectedAt: 1,
                    creatorUsername: {
                        $arrayElemAt: ['$creator.username', 0]
                    },
                    creatorFullname: {
                        $arrayElemAt: ['$creator.fullName', 0]
                    },
                    creatorAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$creator.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$creator.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$creator.mediaEndpoint', 0]
                        },
                    },
                    approverUsername: {
                        $arrayElemAt: ['$approver.username', 0]
                    },
                    approverFullname: {
                        $arrayElemAt: ['$approver.fullName', 0]
                    },
                    approverAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$approver.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$approver.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$approver.mediaEndpoint', 0]
                        },
                    },
                    rejecterUsername: {
                        $arrayElemAt: ['$rejecter.username', 0]
                    },
                    rejecterFullname: {
                        $arrayElemAt: ['$rejecter.fullName', 0]
                    },
                    rejecterAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$rejecter.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$rejecter.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$rejecter.mediaEndpoint', 0]
                        },
                    },
                    // parent: {
                    //     id: {
                    //         $arrayElemAt: ['$parent._id', 0]
                    //     },
                    //     status: {
                    //         $arrayElemAt: ['$parent.status', 0]
                    //     }
                    // }
                    child: {
                        id: {
                            $arrayElemAt: ['$child._id', 0]
                        },
                        status: {
                            $arrayElemAt: ['$child.status', 0]
                        }
                    }
                },
            }
        );
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        let data = await this.guidelineModel.aggregate(pipeline);
        return data;
    }

    async sendRequestEmail(to: string, fullName: string, username: string, dataname: string, updatedAt: string, remark: string, redirectUrl: string) {
        let template = await this.templateService.findByNameAndEventCategory("NOTIFY_GUIDELINE", "NOTIFY_GUIDELINE", "GUIDELINE", "EMAIL");
        let body = template.body_detail_id.toString();
        body = body.replace("${fullName}", fullName);
        body = body.replace("${email}", to);
        body = body.replace("${name}", dataname);
        body = body.replace("${username}", username);
        body = body.replace("${updatedAt}", updatedAt);
        body = body.replace("${remark}", (remark ? remark : "-"));
        body = body.replace("${redirectUrl}", redirectUrl);
        await this.utilsService.sendEmail(to, template.from.toString(), template.subject_id.toString(), body);
    }
}