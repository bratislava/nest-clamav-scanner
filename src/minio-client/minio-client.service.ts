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

  //function which loads file stream from minio bucket
  public async loadFileStream(bucketName: string, fileName: string) {
    try {
      const fileStream = await this.minioService.client.getObject(
        bucketName,
        fileName,
      );
      return fileStream;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which lists all files in minio bucket
  public async listFiles(bucketName: string) {
    try {
      const files = await new Promise((resolve, reject) => {
        const objectsListTemp = [];
        const stream = this.minioService.client.listObjectsV2(
          bucketName,
          '',
          true,
          '',
        );

        stream.on('data', (obj) => objectsListTemp.push(obj.name));
        stream.on('error', reject);
        stream.on('end', () => {
          resolve(objectsListTemp);
        });
      });

      return files;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which checks if file exists in minio bucket
  public async fileExists(bucketName: string, fileName: string) {
    try {
      const result = await this.minioService.client.statObject(
        bucketName,
        fileName,
      );

      return result;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
