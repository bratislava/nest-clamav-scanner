import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BucketFileDto,
  ScanFileResponseDto,
  ScanStatusDto,
} from './scanner.dto';
import { isBase64, isValidBucketUidAndFileUid } from '../common/utils/helpers';

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

  public async scanFile(
    bucketFile: BucketFileDto,
  ): Promise<ScanFileResponseDto> {
    if (!isValidBucketUidAndFileUid(bucketFile.bucketUid, bucketFile.fileUid)) {
      throw new BadRequestException(
        'Please provide a valid bucketUid and fileUid.',
      );
    }

    //check if file has already been scanned
    try {
      const fileStatus = await this.getStatus(
        bucketFile.bucketUid,
        bucketFile.fileUid,
      );
      if (fileStatus) {
        throw new GoneException(
          'This file has already been submitted for scanning. Please check the status of the scan by GET /api/scan/:bucketUid/:fileUid.',
        );
      }
    } catch (error) {
      //silence is golden
      //our goal is to return the exception that file was not scanned, because we don't want to scan the file again
    }
    //list all files in bucket
    const filesInBucket = await this.minioClientService.listFiles(
      bucketFile.bucketUid,
    );
    this.logger.log(filesInBucket);

    //check if file exists in minio
    const fileExists = await this.minioClientService.fileExists(
      bucketFile.bucketUid,
      bucketFile.fileUid,
    );

    if (!fileExists) {
      throw new NotFoundException(
        'This file does not exist in the bucket. Please check the bucketUid and fileUid.',
      );
    }

    return {
      status: 'ACCEPTED',
      message: 'File has been accepted for scanning',
    };

    //scanBucket function which takes bucketId as parameter, checks if clamav is running and if bucket exists in minio. Then it starts clamav scan and returns promise of boolean.
  }

  //function which returns scanner status by fileUid from prisma
  public async getStatus(
    bucketUid64: string,
    fileUid64: string,
  ): Promise<ScanStatusDto> {
    //check if fileUid64 and bucketUid64 are valid base64 strings
    if (!isBase64(bucketUid64) || !isBase64(fileUid64)) {
      throw new BadRequestException(
        'Please provide a valid base64 bucketUid and fileUid.',
      );
    }
    const bucketUid = Buffer.from(bucketUid64, 'base64').toString('ascii');
    const fileUid = Buffer.from(fileUid64, 'base64').toString('ascii');

    if (!isValidBucketUidAndFileUid(bucketUid, fileUid)) {
      throw new BadRequestException(
        'Please provide a valid bucketUid and fileUid.',
      );
    }

    try {
      return await this.prismaService.files.findFirstOrThrow({
        where: {
          AND: [{ bucketUid: bucketUid }, { fileUid: fileUid }],
        },
      });
    } catch (error) {
      throw new NotFoundException(
        `This file: ${fileUid} has not been submitted for scanning. Please submit the file for scanning by POST /api/scan.`,
      );
    }
  }
}
