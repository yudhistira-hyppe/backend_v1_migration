import { Test, TestingModule } from '@nestjs/testing';
import { transactionCoinService } from './transactionCoin.service';

describe('transactionCoinService', () => {
  let service: transactionCoinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [transactionCoinService],
    }).compile();

    service = module.get<transactionCoinService>(transactionCoinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
