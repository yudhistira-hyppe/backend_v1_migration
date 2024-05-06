import { Test, TestingModule } from '@nestjs/testing';
import { transactionCoin3Service } from './transactionCoin.service';
import { transactionCoin3Controller } from './transactionCoin.controller';

describe('transactionCoin2Controller', () => {
  let controller: transactionCoin3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [transactionCoin3Controller],
      providers: [transactionCoin3Service],
    }).compile();

    controller = module.get<transactionCoin3Controller>(transactionCoin3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
