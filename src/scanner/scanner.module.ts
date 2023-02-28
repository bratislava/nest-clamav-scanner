import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService],
  imports: [MinioClientModule],
  exports: [ScannerService],
})
export class ScannerModule {}
