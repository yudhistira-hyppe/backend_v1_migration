import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { logApis, logApisDocument } from './schema/logapis.schema';
import { CreateLogapiDto } from './dto/create-logapi.dto';

@Injectable()
export class LogapisService {
  constructor(
    @InjectModel(logApis.name, 'SERVER_FULL')
    private readonly APIModel: Model<logApisDocument>,
  ) { }

  create(createLogapiDto: CreateLogapiDto) {
    return 'This action adds a new logapi';
  }
  
  async create2(url: string, start:string, end: string, email: string, iduser:string, username:string, reqbody:any[]) {
    // console.log(url, start, end, email, iduser, username);
    // console.log(reqbody);

    var insertdata = new logApis();
    var mongo = require('mongoose');
    insertdata._id = new mongo.Types.ObjectId();
    insertdata.timestamps_start = start;
    insertdata.timestamps_end = end;
    insertdata.url = url;
    
    if(iduser != null)
    {
      insertdata.iduser = mongo.Types.ObjectId(iduser);
    }

    if(email != null)
    {
      insertdata.email = email;
    }

    if(username != null)
    {
      insertdata.username = username;
    }

    if(reqbody != null)
    {
      insertdata.requestBody = [reqbody];
    }

    await this.APIModel.create(insertdata);
  }

  findAll() {
    return this.APIModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} logapi`;
  }

  update(id: number, updateLogapiDto: CreateLogapiDto) {
    return `This action updates a #${id} logapi`;
  }

  remove(id: number) {
    return `This action removes a #${id} logapi`;
  }
}
