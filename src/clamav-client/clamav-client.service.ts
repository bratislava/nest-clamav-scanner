import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as clamd from 'clamdjs';
import { execSync } from 'child_process';
import { Readable as ReadableStream } from 'stream';

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

  scanStream(readStream: ReadableStream): any {
    //scan stream with timeout 20 minutes
    return this.scanner.scanStream(readStream, 60000 * 20);
  }

  //function which gets clam reply
  getScanStatus(result: string): string {
    /* switch (true) {
                           case result.includes('OK') && !result.includes('FOUND'):
                             return 'SAFE';
                           case result.includes('FOUND') && !result.includes('OK'):
                             return 'INFECTED';
                           default:
                             return 'SCAN ERROR';
                         }*/

    if (result.includes('OK') && !result.includes('FOUND')) {
      return 'SAFE';
    }
    if (result.includes('FOUND') && !result.includes('OK')) {
      return 'INFECTED';
    }
    return 'SCAN ERROR';
  }

  //create function which checks if clamav scanner is running
  async isRunning(): Promise<boolean> {
    try {
      this.logger.debug('Checking if clamav is running...');
      const cmd = `echo PING | nc -w 5 ${this.configService.get(
        'CLAMAV_HOST',
      )} ${this.configService.get('CLAMAV_PORT')}`;
      const response = execSync(cmd, { encoding: 'utf8' });
      this.logger.debug(`Clamav running response: ${response}`);
      const result = response.trim() === 'PONG';

      this.logger.debug(`Clamav running result: ${result}`);
      return result;
    } catch (error) {
      this.logger.debug(`Clamav running error: ${error}`);
      return false;
    }
  }

  //function which shows clamav version
  async version(): Promise<string> {
    this.logger.debug('Checking if clamav version...');
    try {
      const version = await clamd.version(
        this.configService.get('CLAMAV_HOST'),
        this.configService.get('CLAMAV_PORT'),
        300,
      );
      this.logger.debug(`Clamav version result: ${version}`);
      return version;
    } catch (error) {
      this.logger.error(`Unable to check if clamav is running: ${error}`);
      return error;
    }
  }
}
