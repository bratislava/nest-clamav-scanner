import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiGoneResponse, ApiNotFoundResponse, ApiResponse, ApiTags,} from '@nestjs/swagger';
import {ScannerService} from './scanner.service';
import {BucketFileDto, ScanFileResponseDto, ScanStatusDto,} from './scanner.dto';

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
    status: 202,
    description: 'File has been accepted for scanning.',
    type: ScanFileResponseDto,
  })
  @ApiGoneResponse({
    status: 410,
    description: 'File has already been processed.',
  })
  scanFile(@Body() bucketFile: BucketFileDto): Promise<ScanFileResponseDto> {
    console.log(bucketFile);
    return this.scannerService.scanFile(bucketFile);
  }

  //get controller which returns status of scanned file. Add swagger documentation.
  @Get(':bucketId/:fileId')
  @ApiResponse({
    status: 200,
    description: 'get status of scanned file. Params are in base64 format.',
    type: ScanStatusDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'File or bucket not found',
  })
  getStatus(
    @Param('bucketId64') bucketId64: string,
    @Param('fileId64') fileId64: string,
  ): Promise<ScanStatusDto> {
    return this.scannerService.getStatus(bucketId64, fileId64);
  }
}
