import { Injectable, NotAcceptableException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisqusDto } from 'src/content/disqus/dto/create-disqus.dto';
import { AppGateway } from 'src/content/socket/socket.gateway';
import { Disqus, DisqusDocument } from '../../../content/disqus/schemas/disqus.schema';

@Injectable()
export class DisqusContentEventService {

  private readonly logger = new Logger(DisqusContentEventService.name);

  constructor(
    @InjectModel(Disqus.name, 'SERVER_FULL')
    private readonly DisqusModel: Model<DisqusDocument>,
    private gtw: AppGateway,
  ) { }

  async create(CreateDisqusDto_: CreateDisqusDto): Promise<Disqus> {
    const createDisqusDto = await this.DisqusModel.create(CreateDisqusDto_);
    return createDisqusDto;
  }

  async findById(id: string): Promise<Disqus> {
    return this.DisqusModel.findOne({ _id: id }).exec();
  }

  async sendDMNotif(room: string, payload: string) {
    return this.gtw.room(room, payload);
  }  

  async update(id: string, CreateDisqusDto_: CreateDisqusDto) {
    this.DisqusModel.updateOne(
      {
        _id: id,
      },
      CreateDisqusDto_,
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