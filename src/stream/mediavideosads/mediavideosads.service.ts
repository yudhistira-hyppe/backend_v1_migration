import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateMediavodeosadsDto } from './dto/create-mediavideosads.dto';
import { Mediavideosads, MediavideosadsDocument } from './schemas/mediavideosads.schema';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';

@Injectable()
export class MediavideosadsService {

    constructor(
        @InjectModel(Mediavideosads.name, 'SERVER_FULL')
        private readonly mediavideosadsModel: Model<MediavideosadsDocument>,
        private seaweedfsService: SeaweedfsService,

    ) { }
    async create(CreateMediavodeosadsDto: CreateMediavodeosadsDto): Promise<Mediavideosads> {
        let data = await this.mediavideosadsModel.create(CreateMediavodeosadsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Mediavideosads[]> {
        return this.mediavideosadsModel.find().exec();
    }

    async findOne(id: string): Promise<Mediavideosads> {
        return this.mediavideosadsModel.findOne({ _id: id }).exec();
    }

    async seaweedfsRead(path: string) {
        var data = await this.seaweedfsService.read(path.replace('/localrepo', ''));
        if (data != null) {
            return data;
        }
    }

    async delete(id: string) {
        const deletedCat = await this.mediavideosadsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createMediavodeosadsDto: CreateMediavodeosadsDto,
    ): Promise<Mediavideosads> {
        let data = await this.mediavideosadsModel.findByIdAndUpdate(
            id,
            createMediavodeosadsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updatemediavidAds(id: Types.ObjectId, videoId: string, duration: number): Promise<Object> {
        let data = await this.mediavideosadsModel.updateOne({ "_id": id },
            { $set: { "videoId": videoId, "duration": duration } });
        return data;
    }
}
