import { Injectable, Logger } from '@nestjs/common';
import {
  ClamavRunningDto,
  ClamavVersionDto,
  MinioRunningDto,
} from './status.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ClamavClientService } from '../clamav-client/clamav-client.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StatusService {
  private minioClientService: MinioClientService;
  private clamavClientService: ClamavClientService;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('StatusService');
    this.clamavClientService = new ClamavClientService(configService);
    this.minioClientService = new MinioClientService();
  }

  //function which checks if minio is running
  public async isMinioRunning(): Promise<MinioRunningDto> {
    try {
      const result = await this.minioClientService.client;
      return {
        running: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        running: false,
      };
    }
  }

  //function which checks if clamav is running
  public async isClamavRunning(): Promise<ClamavRunningDto> {
    try {
      const result = await this.clamavClientService.isRunning();
      return {
        running: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        running: false,
      };
    }
  }

  //function which checks clamav version
  public async clamavVersion(): Promise<ClamavVersionDto> {
    try {
      const result = await this.clamavClientService.version();
      return {
        version: result,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        version: error,
      };
    }
  }
}
