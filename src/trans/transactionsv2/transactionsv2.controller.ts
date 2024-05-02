
import { TransactionsV2Service } from './transactionsv2.service';
import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(private readonly transactionsV2Service: TransactionsV2Service
    ) { }

    @Post('/insert')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Req() request: any) {
        const data = await this.transactionsV2Service.insertTransaction(
            request.body.platform, 
            request.body.transactionProductCode,
            request.body.category,
            request.body.coin,
            request.body.discountCoin,
            request.body.price,
            request.body.discountPrice, 
            request.body.idUserBuy, 
            request.body.idUserSell, 
            request.body.idVoucher, 
            request.body.detail, 
            request.body.status);
        return data;
    }
}
