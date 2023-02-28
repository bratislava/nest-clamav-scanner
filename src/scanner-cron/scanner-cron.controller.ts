import {Controller, Get} from '@nestjs/common';

import {ScannerCronService} from './scanner-cron.service';

/*
  Endpoints
 */
@Controller('')
export class ScannerCronController {
  constructor(private readonly scannerCronService: ScannerCronService) {}

  @Get('api/cronscan')
  async cronScan(): Promise<any> {
    return this.scannerCronService.cronScan();
  }
}
