import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors, BadRequestException, Header, NotAcceptableException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { transactionCoin } from './schemas/transactionCoin.schema';
import { transactionCoinService } from './transactionCoin.service';

@Controller('api/transactioncoin')
export class transactionCoinController {
  constructor(
    private readonly transactionCoinSS: transactionCoinService,
    private readonly utilService: UtilsService,
    private readonly LogAPISS: LogapisService,
  ) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionCoinSS.findOne(id);
  }

  @Get()
  async index() {
    return this.transactionCoinSS.find();
  }

  
}
