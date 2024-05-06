import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors, BadRequestException, Header, NotAcceptableException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
//import { transactionCoin2 } from './schemas/transactionCoin2.schema';
import { transactionCoin3Service } from './transactionCoin.service';

@Controller()
export class transactionCoin3Controller {
  constructor(
    private readonly transactionCoinSS: transactionCoin3Service,
    private readonly utilService: UtilsService,
    private readonly LogAPISS: LogapisService,
  ) { }

  //@Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionCoinSS.findOne(id);
  }

  //@Get()
  async index() {
    return this.transactionCoinSS.find();
  }

  // @Post('/create')
  // @UseGuards(JwtAuthGuard)
  // async createTransaction(@Headers() headers, @Body() body) {
  //   return {}
  //   return this.transactionCoinSS.createTransaction(headers, body);
  // }

  // @Post('/cancel')
  // @UseGuards(JwtAuthGuard)
  // async cancelTransaction(@Headers() headers, @Body() body) {
  //   return {}
  //   return this.transactionCoinSS.cancelTransaction(headers, body);
  // }

}
