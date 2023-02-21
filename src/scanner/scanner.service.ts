import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { BucketFileDto } from './dto/scanner.dto';

@Injectable()
export class ScannerService {
  private readonly logger: Logger;
  private readonly clamavClientService: ClamavClientService;
  private readonly minioClientService: MinioClientService;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('ScannerService');
    this.clamavClientService = new ClamavClientService(configService);
    this.minioClientService = new MinioClientService();
  }

  //scanFile function which takes BucketFileDto as parameter, checks if clamav is running and if file exists in minio bucket. Then it starts clamav scan and returns promise of boolean.
  async scanFile(bucketFileDto: BucketFileDto): Promise<boolean> {
    const clamavRunning = await this.clamavClientService.isRunning();
    if (!clamavRunning) {
      this.logger.error('ClamAV is not running');
      return false;
    }

    const fileExists = await this.minioClientService.fileExists(
      bucketFileDto.fileId,
      bucketFileDto.bucketId,
    );
    if (!fileExists) {
      this.logger.error('File does not exist');
      return false;
    }

    /*
    const result = await this.clamavClientService.scanFile(
      bucketFileDto.fileId,
      bucketFileDto.bucketId,
    );
    return result;
    
     */
  }
}
