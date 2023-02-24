import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BucketFileDto,
  ScanFileResponseDto,
  ScanStatusDto,
} from './scanner.dto';

@Injectable()
export class ScannerService {
  private readonly logger: Logger;
  private readonly clamavClientService: ClamavClientService;

  constructor(
    private readonly configService: ConfigService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new Logger('ScannerService');
    this.clamavClientService = new ClamavClientService(configService);
  }

  //function which returns scanner status by fileUid from prisma
  public async getStatus(
    bucketUid: string,
    fileUid: string,
  ): Promise<ScanStatusDto> {
    return await this.prismaService.scanner.findFirst({
      where: {
        AND: [{ bucketUid: bucketUid }, { fileUid: fileUid }],
      },
    });
  }

  //scanFile function which takes BucketFileDto as parameter, checks if clamav is running and if file exists in minio bucket. Then it starts clamav scan and returns promise of boolean.

  public async scanFile(
    bucketFile: BucketFileDto,
  ): Promise<ScanFileResponseDto> {
    //check if file is already scanned
    const fileStatus = await this.getStatus(
      bucketFile.bucketUid,
      bucketFile.fileUid,
    );
    if (fileStatus) {
      throw new BadRequestException(
        'This file has already been submitted for scanning. Please check the status of the scan by GET /api/scan/:bucketUid/:fileUid.',
      );
    }

    return {
      status: 'ACCEPTED',
      message: 'File has been accepted for scanning',
    };

    //scanBucket function which takes bucketId as parameter, checks if clamav is running and if bucket exists in minio. Then it starts clamav scan and returns promise of boolean.
  }
}
