import { Test, TestingModule } from '@nestjs/testing';
import { transactionCoinService } from './transactionCoin.service';
import { transactionCoinController } from './transactionCoin.controller';

describe('transactionCoinController', () => {
  let controller: transactionCoinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [transactionCoinController],
      providers: [transactionCoinService],
    }).compile();

    controller = module.get<transactionCoinController>(transactionCoinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
