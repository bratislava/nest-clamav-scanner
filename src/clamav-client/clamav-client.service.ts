import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as clamd from 'clamdjs';

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

  async scanStream(readStream: object): Promise<any> {
    return await this.scanner.scanStream(readStream, 1800);
  }

  //function which gets clam reply
  async isCleanReply(result: any): Promise<boolean> {
    return await this.scanner.isCleanReply(result);
  }

  //create function which checks if clamav scanner is running
  async isRunning(): Promise<boolean> {
    try {
      const result = await clamd.ping(
        this.configService.get('CLAMAV_HOST'),
        this.configService.get('CLAMAV_PORT'),
        300,
      );
      return result;
    } catch (error) {
      this.logger.error(error);
      return false;
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
      return error;
    }
  }
}
