import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ClamavRunningDto,
  ClamavVersionDto,
  MinioRunningDto,
} from './status.dto';
import { StatusService } from './status.service';

@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  //endpoint to check if minio is running
  @ApiOperation({
    summary: 'Check minio status',
    description: 'This endpoint checks if minio is running',
  })
  @Get('minio/stauts')
  isMinioRunning(): Promise<MinioRunningDto> {
    return this.statusService.isMinioRunning();
  }

  //endpoint to check if clamav is running
  @ApiOperation({
    summary: 'Check clamav status',
    description: 'This endpoint checks if clamav is running',
  })
  @Get('clamav/status')
  isClamavRunning(): Promise<ClamavRunningDto> {
    return this.statusService.isClamavRunning();
  }

  //endpoint to show clamav version
  @ApiOperation({
    summary: 'Show clamav version',
    description: 'This endpoint shows clamav version',
  })
  @Get('clamav/version')
  version(): Promise<ClamavVersionDto> {
    return this.statusService.clamavVersion();
  }
}
