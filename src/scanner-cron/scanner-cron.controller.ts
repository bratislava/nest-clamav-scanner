import {Controller, Get} from '@nestjs/common';

import {ScannerCronService} from './scanner-cron.service';

/*
  Endpoints
 */
@Controller('')
export class ScannerCronController {
  constructor(private readonly scannerCronService: ScannerCronService) {
  }

  @Get('api/cronstart')
  async cronStart(): Promise<any> {
    return this.scannerCronService.cronStart();
  }
}
