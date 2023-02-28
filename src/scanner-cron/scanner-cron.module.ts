import { Module } from '@nestjs/common';
import { ScannerCronController } from './scanner-cron.controller';
import { ScannerCronService } from './scanner-cron.service';
import { ScannerModule } from '../scanner/scanner.module';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { ClamavClientModule } from '../clamav-client/clamav-client.module';

@Module({
  controllers: [ScannerCronController],
  providers: [ScannerCronService],
  imports: [ScannerModule, MinioClientModule, ClamavClientModule],
})
export class ScannerCronModule {}
