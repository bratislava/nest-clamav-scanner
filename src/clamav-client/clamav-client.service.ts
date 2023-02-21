import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as clamd from 'clamdjs';
import { RunningClamavDto } from './clamav-client.dto';

@Injectable()
export class ClamavClientService {
  private readonly logger: Logger;
  private readonly scanner: clamd;

  //constructor with configService
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('ClamavClientService');

    //connection initialisation to clamav
    this.scanner = clamd.createScanner(
      configService.get('CLAMAV_HOST'),
      configService.get('CLAMAV_PORT'),
    );
  }

  //create function which checks if clamav scanner is running
  async isRunning(): Promise<RunningClamavDto> {
    try {
      const result = await clamd.ping(
        this.configService.get('CLAMAV_HOST'),
        this.configService.get('CLAMAV_PORT'),
        300,
      );
      return {
        running: result,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        running: false,
      };
    }
  }

  //function which shows clamav version
  async version(): Promise<string> {
    try {
      const version = await clamd.version(
        this.configService.get('CLAMAV_HOST'),
        this.configService.get('CLAMAV_PORT'),
        300,
      );
      return version;
    } catch (error) {
      this.logger.error(error);
      return 'error';
    }
  }
}
