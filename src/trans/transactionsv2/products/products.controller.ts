import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/transactions/v2/balanceds')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService, 
    ) { }
}
