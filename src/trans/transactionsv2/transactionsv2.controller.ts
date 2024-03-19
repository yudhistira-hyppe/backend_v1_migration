import { Controller } from '@nestjs/common';
import { TransactionsV2Service } from './transactionsv2.service';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(private readonly transactionsV2Service: TransactionsV2Service, private readonly logapiSS: LogapisService) { }
}
