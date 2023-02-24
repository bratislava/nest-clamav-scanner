import { Injectable, Logger } from '@nestjs/common';
import { ClamavVersionDto, ServiceRunningDto } from './status.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ClamavClientService } from '../clamav-client/clamav-client.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatusService {
  private clamavClientService: ClamavClientService;
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new Logger('StatusService');
    this.clamavClientService = new ClamavClientService(configService);
  }

  //function which checks if prisma is running
  public async isPrismaRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.prismaService.isRunning();
      return {
        running: result,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        running: false,
      };
    }
  }

  //function which checks if minio is running
  public async isMinioRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.minioClientService.client();
      this.logger.log(result);
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
  public async isClamavRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.clamavClientService.isRunning();
      return {
        running: result,
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
