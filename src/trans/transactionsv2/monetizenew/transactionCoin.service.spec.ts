import { Test, TestingModule } from '@nestjs/testing';
import { transactionCoin3Service } from './transactionCoin.service';

describe('transactionCoinService', () => {
  let service: transactionCoin3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [transactionCoin3Service],
    }).compile();

    service = module.get<transactionCoin3Service>(transactionCoin3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
