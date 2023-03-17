import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { PrismaService } from '../prisma/prisma.service';

describe('ScannerController', () => {
  let configService: ConfigService;
  let scannerController: ScannerController;
  let scannerService: ScannerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ScannerController],
      providers: [ScannerService, ConfigService, PrismaService],
      imports: [MinioClientModule],
    }).compile();

    scannerController = moduleRef.get<ScannerController>(ScannerController);
    scannerService = moduleRef.get<ScannerService>(ScannerService);
  });

  describe('scanFile', () => {
    it('should return accepted state for the file', async () => {
      const request = {
        fileUid: 'name.jpg',
      };

      const result = {
        status: 'ACCEPTED',
        id: '1',
        fileUid: 'name.jpg',
        message: `File: name.jpg has been successfully accepted for scanning.`,
      };

      jest
        .spyOn(scannerService, 'scanFile')
        .mockImplementation(async () => result);
      console.log(result);
      expect(await scannerService.scanFile(request)).toBe(result);
    });
  });
});
