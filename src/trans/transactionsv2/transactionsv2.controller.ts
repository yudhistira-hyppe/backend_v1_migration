
import { TransactionsV2Service } from './transactionsv2.service';
import { Controller } from '@nestjs/common';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(private readonly transactionsV2Service: TransactionsV2Service
    ) { }
}
