import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { ClamavClientModule } from '../clamav-client/clamav-client.module';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService],
  imports: [MinioClientModule, ClamavClientModule],
})
export class ScannerModule {}
