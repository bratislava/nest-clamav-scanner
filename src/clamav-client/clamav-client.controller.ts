import { Controller, Get } from '@nestjs/common';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { ApiOperation } from '@nestjs/swagger';
import { RunningClamavDto } from './clamav-client.dto';

@Controller('clamav')
export class ClamavClientController {
  constructor(private readonly clamavClientService: ClamavClientService) {}

  //endpoint to check if clamav is running
  @ApiOperation({
    summary: 'Check clamav status',
    description: 'This endpoint checks if clamav is running',
  })
  @Get('status')
  isRunning(): Promise<RunningClamavDto> {
    return this.clamavClientService.isRunning();
  }

  //endpoint to show clamav version
  @ApiOperation({
    summary: 'Show clamav version',
    description: 'This endpoint shows clamav version',
  })
  @Get('version')
  version(): Promise<string> {
    return this.clamavClientService.version();
  }
}
