import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogMigrations, LogMigrationsDocument } from './schema/logmigrations.schema';

@Injectable()
export class LogMigrationsService {

    constructor(
        @InjectModel(LogMigrations.name, 'SERVER_FULL')
        private readonly LogMigrationsModel: Model<LogMigrationsDocument>,
    ) { }

    async create(LogMigrations_: LogMigrations): Promise<LogMigrations> {
        const _LogMigrations_ = await this.LogMigrationsModel.create(
            LogMigrations_,
        );
        return _LogMigrations_;
    }

    async update(id: string, LogMigrations_: LogMigrations): Promise<LogMigrations> {
        let data = await this.LogMigrationsModel.findByIdAndUpdate(id, LogMigrations_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async findAll(): Promise<LogMigrations[]> {
        return this.LogMigrationsModel.find().exec();
    }

    async findOne(id: string): Promise<LogMigrations> {
        return this.LogMigrationsModel.findOne({ _id: id }).exec();
    }

    async findbankcode(bankcode: string): Promise<LogMigrations> {
        return this.LogMigrationsModel.findOne({ bankcode: bankcode }).exec();
    }
}
