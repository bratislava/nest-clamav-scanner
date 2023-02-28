import {
  Injectable,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ScannerService } from '../scanner/scanner.service';
import { PrismaService } from '../prisma/prisma.service';
import { isValidScanStatus, listOfStatuses } from '../common/utils/helpers';
import { ClamavClientService } from '../clamav-client/clamav-client.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScannerCronService {
  private readonly logger = new Logger('ScannerCronService');
  private readonly clamavClientService: ClamavClientService;

  constructor(
    private scannerService: ScannerService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.clamavClientService = new ClamavClientService(configService);
  }

  async cronScan(): Promise<any> {
    //check if clamav is running
    const clamavRunning = await this.clamavClientService.isRunning();
    if (!clamavRunning) {
      throw new PreconditionFailedException('Clamav is not running');
    }

    //get all files which are in state ACCEPTED
    const files = await this.prismaService.files.findMany({
      where: {
        status: 'ACCEPTED',
      },
      take: 10,
    });

    //scan batch of files
    for (const file of files) {
      this.logger.log(`Scanning file ${file.fileUid}`);

      //update scan status of file to SCANNING
      /*
                                                                                                                              const updateScanStatus = await this.prismaService.files.update({
                                                                                                                                data: {
                                                                                                                                  status: 'SCANNING',
                                                                                                                                },
                                                                                                                                where: {
                                                                                                                                  id: file.id,
                                                                                                                                },
                                                                                                                              });
                                                                                                                              */

      //load file from minio
      const fileStream = await this.minioClientService.loadFileStream(
        file.bucketUid,
        file.fileUid,
      );

      if (fileStream === false) {
        this.logger.error(
          `File ${file.fileUid} not found in minio bucket ${file.bucketUid}`,
        );
        throw new NotFoundException(
          `File ${file.fileUid} not found in minio bucket ${file.bucketUid}`,
        );
      }

      const startTime = Date.now();
      let result;
      try {
        result = await this.clamavClientService.scanStream(fileStream);
      } finally {
        // Ensure stream is destroyed in all situations to prevent any
        // resource leaks.
        fileStream.destroy();
      }

      const scanDuration = Date.now() - startTime;
      this.logger.log(
        `File ${file.fileUid} was scanned in: ${scanDuration}ms with result: ${result}`,
      );
    }
  }

  async updateScanStatus(from: string, to: string): Promise<any> {
    //check if from and to status are valid
    if (!isValidScanStatus(from) && !isValidScanStatus(to)) {
      throw new Error(
        'Please provide a valid scan status. Available options are:' +
          listOfStatuses(),
      );
    }

    //update scan status of files which are in state ACCEPTED to new state which is QUEUE
    const updateScanStatus = await this.prismaService.files.updateMany({
      data: {
        status: to,
      },
      where: {
        status: from,
      },
    });
    return updateScanStatus;
  }
}
