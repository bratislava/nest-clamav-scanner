import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {ScannerService} from './scanner.service';
import {ScanFileDto, ScanFileResponseDto, ScanStatusDto} from './scanner.dto';

/*
  Endpoints
 */
@ApiTags('Scanner')
@Controller('api/scan')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

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
            fileUid: 'name.jpg',
          },
        ],
      },
      moreFiles: {
        value: [
          {
            fileUid: 'name.jpg',
          },
          {
            fileUid: 'name2.jpg',
          },
          {
            fileUid: 'name3.jpg',
          },
        ],
      },
      specifyBucket: {
        value: [
          {
            fileUid: 'name.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
          {
            fileUid: 'name2.jpg',
          },
          {
            fileUid: 'name3.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
        ],
      },
      specifyUserUid: {
        value: [
          {
            fileUid: 'name.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
            userUid: 'user-unique-name-or-uid',
          },
          {
            fileUid: 'name2.jpg',
            userUid: 'user-unique-name-or-uid',
          },
          {
            fileUid: 'name3.jpg',
            bucketUid: 'bucket-unique-name-or-uid',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files has been accepted for scanning.',
    type: ScanFileResponseDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Wrong parameters provided.',
  })
  scanFiles(
    @Body() bucketFiles: ScanFileDto[],
  ): Promise<ScanFileResponseDto[]> {
    return this.scannerService.scanFiles(bucketFiles);
  }

  @Post('file')
  @ApiOperation({
    summary: 'Scan list of files in bucket via clamav scanner.',
    description:
      'You have to provide list of files which are already uploaded to bucket and you want to scan them. Service will return list of files with status saying that files where accepted for scanning. If not then proper error will be propagated.',
  })
  @ApiResponse({
    status: 201,
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
  scanFile(@Body() bucketFile: ScanFileDto): Promise<ScanFileResponseDto> {
    return this.scannerService.scanFile(bucketFile);
  }

  //get controller which returns status of scanned file. Add swagger documentation.
  @Get(':fileUid64/:bucketUid64')
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
  getStatus(
    @Param('bucketUid64') bucketId64: string,
    @Param('fileUid64') fileId64: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.getStatus(bucketId64, fileId64);
  }

  //get controller which returns status of scanned file by record id or by name in
  @Get(':resourceId')
  @ApiResponse({
    status: 200,
    description:
      'Get status of scanned file by record id or by fileUid in base64. When using fileUid (filename) in base64 we will use default bucket as default.',
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
  getStatusById(
    @Param('resourceId') resourceId: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.getStatusByResourceId(resourceId);
  }
}
