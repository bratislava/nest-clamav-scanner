import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScanFileDto, ScanFileResponseDto, ScanStatusDto } from './scanner.dto';
import {
  isBase64,
  isDefined,
  isValidBucketUidAndFileUid,
} from '../common/utils/helpers';

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

  public async scanFile(bucketFile: ScanFileDto): Promise<ScanFileResponseDto> {
    if (!isValidBucketUidAndFileUid(bucketFile.bucketUid, bucketFile.fileUid)) {
      throw new BadRequestException(
        'Please provide a valid bucketUid and fileUid.',
      );
    }

    //check if file has already been scanned - record is in database
    const fileStatus = await this.prismaService.files.findFirst({
      where: {
        AND: [
          { bucketUid: bucketFile.bucketUid },
          { fileUid: bucketFile.fileUid },
        ],
      },
    });

    if (fileStatus) {
      //base64 bucketUid and fileUid
      const bucketUid64 = Buffer.from(bucketFile.bucketUid).toString('base64');
      const fileUid64 = Buffer.from(bucketFile.fileUid).toString('base64');

      throw new GoneException(
        `This file has already been submitted for scanning. Please check the status of the scan by GET /api/scan/${bucketUid64}/${fileUid64}`,
      );
    }

    //check if file exists in minio
    const fileInfo = await this.minioClientService.fileExists(
      bucketFile.bucketUid,
      bucketFile.fileUid,
    );

    if (!fileInfo) {
      throw new NotFoundException(
        'This file does not exist in the bucket. Please check the bucketUid and fileUid.',
      );
    }

    if (fileInfo.size > this.configService.get('MAX_FILE_SIZE')) {
      throw new PayloadTooLargeException(
        'File size exceeds the maximum allowed size. Please check the file size.',
      );
    }

    try {
      const result = await this.prismaService.files.create({
        data: {
          bucketUid: bucketFile.bucketUid,
          fileUid: bucketFile.fileUid,
          userUid: bucketFile.userUid,
          fileSize: fileInfo.size,
          fileMimeType: fileInfo.metaData['content-type'],
          status: 'ACCEPTED',
        },
      });

      return {
        status: 'ACCEPTED',
        message: `File: ${bucketFile.fileUid} has been successfully accepted for scanning.`,
        id: result.id,
      };
    } catch (error) {
      this.logger.error(error);
      throw new UnprocessableEntityException(
        `There was an error while saving the file to the database. Please try again later.`,
      );
    }
  }

  //function which returns scanner status by fileUid from prisma
  public async getStatus(
    bucketUid64: string,
    fileUid64: string,
  ): Promise<ScanStatusDto> {
    //check if fileUid64 and bucketUid64 are valid base64 strings
    if (!isBase64(bucketUid64) || !isBase64(fileUid64)) {
      throw new BadRequestException(
        'Base64 of bucketUid or fileUid is not correct.',
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

  public async getStatusById(id: string): Promise<ScanStatusDto> {
    if (!isDefined(id)) {
      throw new BadRequestException('Please provide a valid id');
    }

    if (isBase64(id)) {
      throw new BadRequestException(
        'Please provide a valid id. Id should not be base64 encoded.',
      );
    }

    try {
      return await this.prismaService.files.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `This file with id: ${id} has not been submitted for scanning. Please submit the file for scanning by POST /api/scan.`,
      );
    }
  }
}
