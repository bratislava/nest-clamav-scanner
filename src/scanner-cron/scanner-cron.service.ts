import {
  Injectable,
  Logger,
  PreconditionFailedException,
} from '@nestjs/common';
import { ScannerService } from '../scanner/scanner.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  chunkArray,
  isValidScanStatus,
  listOfStatuses,
} from '../common/utils/helpers';
import { ClamavClientService } from '../clamav-client/clamav-client.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ConfigService } from '@nestjs/config';
import { Files } from '@prisma/client';
import { Readable as ReadableStream } from 'stream';
import { Cron } from '@nestjs/schedule';
import { FormsClientService } from '../forms-client/forms-client.service';

@Injectable()
export class ScannerCronService {
  private readonly logger = new Logger('ScannerCronService');

  constructor(
    private scannerService: ScannerService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly clamavClientService: ClamavClientService,
    private readonly formsClientService: FormsClientService,
  ) {}

  //set cron service every 20 seconds
  @Cron('*/20 * * * * *', {
    name: 'cronStart',
    timeZone: 'Europe/Berlin',
  })
  async cronStart(): Promise<void> {
    //check if cron is already running
    this.logger.log('CronScan waking up...');
    if (global.CronRunning) {
      this.logger.log(
        'CronScan another process is already running. Sleeping...',
      );
      return;
    }
    global.CronRunning = true;

    //check if clamav is running
    const clamavRunning = await this.clamavClientService.isRunning();
    if (!clamavRunning) {
      global.CronRunning = false;
      throw new PreconditionFailedException(
        'Clamav is not running. Sleeping...',
      );
    }

    //check if forms is running
    const formsRunning = await this.formsClientService.isRunning();
    if (!formsRunning) {
      global.formsRunning = false;
    }

    //check if we have some files which where not notified to forms client. If yes, try to notify them.
    if (global.formsRunning) {
      try {
        await this.fixUnnotifiedFiles();
      } catch (error) {
        global.CronRunning = false;
        throw new PreconditionFailedException(
          'Unable to send statuses of unnotified files. Sleeping. Error: ' +
            error,
        );
      }
    }

    //check if we have some stacked files when process was stopped and fix them
    try {
      await this.fixStackedFiles();
    } catch (error) {
      global.CronRunning = false;
      throw new PreconditionFailedException(
        'Unable to fix stacked files. Error: ' + error,
      );
    }

    await this.mainScanBatchProcess();
    this.logger.log('CronScan sleeping...');
    global.CronRunning = false;
    return;
  }

  async mainScanBatchProcess(): Promise<any> {
    //get all files which are in state ACCEPTED
    const files = await this.prismaService.files.findMany({
      where: {
        status: 'ACCEPTED',
      },
      take: 80,
    });

    //if no files are found, return
    if (files.length === 0) {
      this.logger.log('No files found to scan (searching for ACCEPTED state).');
      return;
    }
    this.logger.log(`Found ${files.length} files to scan.`);

    //update status of array files to QUEUED
    const updateStatus = this.updateScanStatusBatch(files, 'QUEUED');
    if (!updateStatus) {
      throw new PreconditionFailedException(
        'Could not update status QUEUED of files.',
      );
    }

    //split files into batches of 4 elements
    const filesBatches = chunkArray(files, 4);

    //scan batch of files
    let j = 1;
    for (const files of filesBatches) {
      this.logger.debug(`Scanning ${j}. batch of ${files.length} files.`);

      global.formsRunning = await this.formsClientService.isRunning();

      const promiseQueue = [];
      for (const file of files) {
        promiseQueue.push(this.scanFileProcess(file));
      }

      //wait for all promises to be resolved
      const results = await Promise.all(promiseQueue);
      this.logger.log(
        `Batch scan finished with results: ${results.join(', ')}`,
      );
      j++;
    }
    this.logger.log(`All batches scanned. Sleeping.`);
  }

  async scanFileProcess(file: Files): Promise<string> {
    try {
      await this.updateScanStatusWithNotify(file.id, 'SCANNING');
    } catch (error) {
      throw new PreconditionFailedException(
        `${file.fileUid} could not be updated to SCANNING status.`,
      );
    }

    let fileStream;
    try {
      fileStream = await this.minioClientService.loadFileStream(
        file.bucketUid,
        file.fileUid,
      );
    } catch (error) {
      await this.updateScanStatusWithNotify(file.id, 'NOT FOUND');

      this.logger.error(`${file.fileUid} not found in minio bucket.`);
      return 'NOT FOUND';
    }
    this.logger.debug(`${file.fileUid} is in Minio`);

    //scan file in clamav
    let scanStatus;
    try {
      scanStatus = await this.scanFileInClamav(file, fileStream);
    } catch (error) {
      this.logger.error(
        `${file.fileUid} could not be scanned. Error: ${error}`,
      );
      await this.updateScanStatusWithNotify(file.id, 'SCAN ERROR');
      return 'SCAN ERROR';
    }

    //move file to safe or infected bucket if scan status is SAFE or INFECTED
    if (scanStatus.includes('SAFE', 'INFECTED')) {
      try {
        const destinationBucket = this.configService.get(
          `CLAMAV_${scanStatus}_BUCKET`,
        );
        await this.minioClientService.moveFileBetweenBuckets(
          file.bucketUid,
          file.fileUid,
          destinationBucket,
          file.fileUid,
        );
      } catch (error) {
        await this.updateScanStatusWithNotify(
          file.id,
          'MOVE ERROR' + scanStatus,
        );

        throw new PreconditionFailedException(
          `${file.fileUid} could not be moved to ${scanStatus} bucket.`,
        );
      }
    }

    //update scan status of file
    try {
      await this.updateScanStatusWithNotify(file.id, scanStatus);
    } catch (error) {
      throw new PreconditionFailedException(
        `${file.fileUid} could not be updated to ${scanStatus} status.`,
      );
    }

    return scanStatus;
  }

  async scanFileInClamav(
    file: Files,
    fileStream: ReadableStream,
  ): Promise<string> {
    const startTime = Date.now();
    this.logger.debug(`${file.fileUid} scanning started`);
    let response;
    try {
      response = await this.clamavClientService.scanStream(fileStream);

      this.logger.debug(
        `${file.fileUid} scanning response from clamav: ${response}`,
      );
    } catch (error) {
      this.logger.debug(error);
    } finally {
      //stream is destroyed in all situations to prevent any resource leaks.
      fileStream.destroy();
    }
    const result = this.clamavClientService.getScanStatus(response);
    const scanDuration = Date.now() - startTime;
    this.logger.log(
      `${file.fileUid} was scanned in: ${scanDuration}ms with result: ${result}`,
    );

    return result;
  }

  async updateScanStatusBatch(files: Files[], to: string): Promise<boolean> {
    //check if from and to status are valid
    if (!isValidScanStatus(to)) {
      throw new Error(
        'Please provide a valid scan status. Available options are:' +
          listOfStatuses(),
      );
    }

    //update scan status of files
    try {
      await this.prismaService.files.updateMany({
        where: {
          id: {
            in: files.map((file) => file.id),
          },
        },
        data: {
          status: to,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async updateScanStatusWithNotify(id: string, status: string): Promise<any> {
    if (!isValidScanStatus(status)) {
      throw new Error(
        'Please provide a valid scan status. Available options are:' +
          listOfStatuses(),
      );
    }

    //if forms are running, update the status of the file
    let notifiedStatus = false;

    //if state is SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE or NOT FOUND, update the status of the file in forms
    if (
      global.formsRunning &&
      [
        'SAFE',
        'INFECTED',
        'NOT FOUND',
        'MOVE ERROR SAFE',
        'MOVE ERROR INFECTED',
      ].includes(status)
    ) {
      notifiedStatus = await this.formsClientService.updateFileStatus(
        id,
        status,
      );
    }

    //update scan status of files which are in state ACCEPTED to new state which is QUEUE
    const updateScanStatus = await this.prismaService.files.update({
      data: {
        status: status,
        notified: notifiedStatus,
      },
      where: {
        id: id,
      },
    });

    return updateScanStatus;
  }

  //function which checks if some files are in state QUEUED or SCANNING and if so, it starts the scan process
  async fixStackedFiles(): Promise<void> {
    //get all files which are in state QUEUED or SCANNING
    const stackedFiles = await this.prismaService.files.findMany({
      where: {
        OR: [
          {
            status: 'QUEUED',
          },
          {
            status: 'SCANNING',
          },
          {
            status: 'SCAN ERROR',
          },
        ],
      },
      take: 200,
    });

    //if no files are found, return
    if (stackedFiles.length === 0) {
      this.logger.debug('No stacked files found.');
      return;
    } else {
      this.logger.debug(
        `Found ${stackedFiles.length} stacked files from unfinished runs. Changing state status to ACCEPTED.`,
      );
    }

    //update status of array files to ACCEPTED
    const updateStatus = this.updateScanStatusBatch(stackedFiles, 'ACCEPTED');
    if (!updateStatus) {
      throw new PreconditionFailedException(
        'Could not update status ACCEPTED of stacked files.',
      );
    }
    return;
  }

  //fix unnotified files  which are in state SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE or NOT FOUND
  async fixUnnotifiedFiles(): Promise<void> {
    //get all files which are in state SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE or NOT FOUND
    const unnotifiedFiles = await this.prismaService.files.findMany({
      where: {
        OR: [
          {
            status: 'SAFE',
          },
          {
            status: 'INFECTED',
          },
          {
            status: 'MOVE ERROR INFECTED',
          },
          {
            status: 'MOVE ERROR SAFE',
          },
          {
            status: 'NOT FOUND',
          },
        ],
        notified: false,
      },
      take: 200,
    });

    //if no files are found, return
    if (unnotifiedFiles.length === 0) {
      this.logger.log(
        'No unnotified files found. Every change was send to forms backend.',
      );
      return;
    }

    this.logger.log(
      `Found ${unnotifiedFiles.length} unnotified files which were not notified to forms backend. Starting notification process.`,
    );

    //notify forms backend about the status of the files
    for (const file of unnotifiedFiles) {
      try {
        await this.updateScanStatusWithNotify(file.id, file.status);
      } catch (error) {
        this.logger.error(
          `Could not notify forms backend about file ${file.fileUid} with status ${file.status}.`,
        );
      }
    }
  }
}
