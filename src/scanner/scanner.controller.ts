import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ScannerService } from './scanner.service';
import { ScanFileDto, ScanFileResponseDto, ScanStatusDto } from './scanner.dto';
import { BasicGuard } from '../auth/guards/auth-basic.guard';

/*
  Endpoints
 */
@ApiTags('Scanner')
@Controller('api/scan')
export class ScannerController {
  private readonly logger: Logger;

  constructor(private readonly scannerService: ScannerService) {
    this.logger = new Logger('ScannerController');
  }

  //post controller which accepts bucket file dto and starts clamav scan. Add swagger documentation.
  @Post('files')
  @ApiOperation({
    summary: 'Scan list of files in bucket via clamav scanner.',
    description:
      'You have to provide list of files which are already uploaded to bucket and you want to scan them. Service will return list of files with status saying that files where accepted for scanning. If not then proper error will be propagated.',
  })
  @ApiBody({
    type: [ScanFileDto],
    isArray: true,
    description: 'List of files to scan.',
    examples: {
      oneFile: {
        value: [
          {
            minioFileName: 'name.jpg',
          },
        ],
      },
      moreFiles: {
        value: [
          {
            minioFileName: 'name.jpg',
          },
          {
            minioFileName: 'name2.jpg',
          },
          {
            minioFileName: 'name3.jpg',
          },
        ],
      },
      specifyBucket: {
        value: [
          {
            minioFileName: 'name.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
          {
            minioFileName: 'name2.jpg',
          },
          {
            minioFileName: 'name3.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
        ],
      },
      specifyUserUid: {
        value: [
          {
            minioFileName: 'name.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
            userUid: 'user-unique-name-or-uid',
          },
          {
            minioFileName: 'name2.jpg',
            userUid: 'user-unique-name-or-uid',
          },
          {
            minioFileName: 'name3.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Files has been accepted for scanning.',
    type: ScanFileResponseDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Wrong parameters provided.',
  })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  scanFiles(
    @Body() bucketFiles: ScanFileDto[],
  ): Promise<ScanFileResponseDto[]> {
    this.logger.debug(`Scan files request: ${JSON.stringify(bucketFiles)}`);
    return this.scannerService.scanFiles(bucketFiles);
  }

  @Post('file')
  @ApiOperation({
    summary: 'Scan list of files in bucket via clamav scanner.',
    description:
      'You have to provide list of files which are already uploaded to bucket and you want to scan them. Service will return list of files with status saying that files where accepted for scanning. If not then proper error will be propagated.',
  })
  @ApiResponse({
    status: 202,
    description: 'Files has been accepted for scanning.',
    type: ScanFileResponseDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Wrong parameters provided.',
  })
  @ApiGoneResponse({
    status: 410,
    description: 'File has already been processed.',
  })
  @ApiPayloadTooLargeResponse({
    status: 413,
    description: 'File for scanning is too large.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'File did or bucket uid contains invalid parameters.',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'File or bucket not found.',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  scanFile(@Body() bucketFile: ScanFileDto): Promise<ScanFileResponseDto> {
    this.logger.debug(`Scan file request: ${JSON.stringify(bucketFile)}`);
    return this.scannerService.scanFile(bucketFile);
  }

  //get controller which returns status of scanned file. Add swagger documentation.
  @Get('file/:minioFileName64/:bucketUid64')
  @ApiResponse({
    status: 200,
    description: 'get status of scanned file. Params are in base64 format.',
    type: ScanStatusDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'File or bucket not found',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'File did or bucket uid contains invalid parameters.',
  })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  getStatus(
    @Param('bucketUid64') bucketId64: string,
    @Param('minioFileName64') fileId64: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.getStatus(bucketId64, fileId64);
  }

  //get controller which returns status of scanned file by record id or by name in
  @Get('file/:resourceId')
  @ApiResponse({
    status: 200,
    description:
      'Get status of scanned file by record id or by minioFileName in base64. When using minioFileName (filename) in base64 we will use default bucket as default.',
    type: ScanStatusDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'File did or bucket uid contains invalid parameters.',
  })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  getStatusById(
    @Param('resourceId') resourceId: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.getStatusByResourceId(resourceId);
  }

  @Delete('file/:resourceId')
  @ApiResponse({
    status: 200,
    description: 'Delete scanned file by record id.',
    type: ScanStatusDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'File did or bucket uid contains invalid parameters.',
  })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  deleteFileById(
    @Param('resourceId') resourceId: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.deleteFile(resourceId);
  }
}
