import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
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
  @Post()
  @ApiResponse({
    status: 201,
    description: 'File has been accepted for scanning.',
    type: ScanFileResponseDto,
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
