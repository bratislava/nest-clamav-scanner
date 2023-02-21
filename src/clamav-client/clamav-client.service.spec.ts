import { Test, TestingModule } from '@nestjs/testing';
import { ClamavClientService } from './clamav-client.service';

describe('ClamavClientService', () => {
  let service: ClamavClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClamavClientService],
    }).compile();

    service = module.get<ClamavClientService>(ClamavClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
