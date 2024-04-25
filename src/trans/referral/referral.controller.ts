import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { Referral } from './schemas/referral.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/referral')
export class ReferralController {

  constructor(private readonly referralService: ReferralService) { }

  @Post()
  async create(@Body() CreateSagasDto: CreateReferralDto) {
    await this.referralService.create(CreateSagasDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Referral[]> {
    return this.referralService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Referral> {
    return this.referralService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.referralService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/list')
  async list(@Req() request: Request) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    let skip = (request_json.page > 0 ? request_json.page : 0) * request_json.limit;
    return this.referralService.listAll(request_json.email, request_json.from, request_json.to, request_json.jenis, request_json.username, skip, request_json.limit);
  }

}
