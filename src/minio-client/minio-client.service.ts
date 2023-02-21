import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly minio: MinioService;

  constructor() {
    this.logger = new Logger('MinioClientService');
  }

  public get client() {
    return this.minio.client;
  }

  //function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string) {
    try {
      const bucketExists = await this.minio.client.bucketExists(bucketName);
      return bucketExists;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which checks if file exists in minio bucket
  public async fileExists(bucketName: string, fileName: string) {
    try {
      const fileExists = await this.minio.client.statObject(
        bucketName,
        fileName,
      );
      return fileExists;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
