import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;

  constructor(private readonly minioService: MinioService) {
    this.logger = new Logger('MinioClientService');
  }

  public async client() {
    this.logger.log('MinioClientService.client');
    return this.minioService.client;
  }

  //function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string) {
    try {
      await this.minioService.client.bucketExists(bucketName);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which checks if file exists in minio bucket
  public async fileExists(bucketName: string, fileName: string) {
    try {
      await this.minioService.client.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
