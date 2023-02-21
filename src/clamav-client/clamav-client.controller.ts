import { Controller, Get } from '@nestjs/common';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('clamav')
export class ClamavClientController {
  constructor(private readonly clamavClientService: ClamavClientService) {}

  //endpoint to check if clamav is running
  @ApiOperation({
    summary: 'Check clamav status',
    description: 'This endpoint checks if clamav is running',
  })
  @Get('status')
  isRunning(): Promise<boolean> {
    return this.clamavClientService.isRunning();
  }
}
