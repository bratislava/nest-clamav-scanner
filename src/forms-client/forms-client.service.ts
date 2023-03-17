import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FormsClientService {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('FormsClientService');
  }

  //create function which will check health status of forms client with axios and using forms client url NEST_FORMS_BACKEND
  public async isRunning(): Promise<boolean> {
    try {
      const url = this.configService.get('NEST_FORMS_BACKEND') + '/healthcheck';
      const response = await axios.get(url, {
        timeout: 2000,
      });
      this.logger.debug(
        'FormsClientService.healthCheck response.data: ' + response.data,
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error('FormsClientService.healthCheck error: ' + error);
      return false;
    }
  }

  //create function which will post array of files to forms client with axios and using forms client url NEST_FORMS_BACKEND with upadted statuses
  public async updateFileStatus(id: string, status: string): Promise<boolean> {
    try {
      const url = this.configService.get('NEST_FORMS_BACKEND') + '/files';
      const response = await axios.post(
        url,
        {},
        {
          timeout: 2000,
        },
      );
      this.logger.debug(
        'FormsClientService.postFiles response.data: ' + response.data,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error while notifying forms backend: ' + error);
      return false;
    }
  }
}
