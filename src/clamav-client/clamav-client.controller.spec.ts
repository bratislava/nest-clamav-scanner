import { Test, TestingModule } from '@nestjs/testing';
import { ClamavClientController } from './clamav-client.controller';

describe('ClamavClientController', () => {
  let controller: ClamavClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClamavClientController],
    }).compile();

    controller = module.get<ClamavClientController>(ClamavClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
