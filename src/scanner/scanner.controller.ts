import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScannerService } from './scanner.service';
import { BucketFileDto } from './dto/scanner.dto';

/*
  Endpoints
 */
@ApiTags('Scanner')
@Controller('api/scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  //create post controller which accepts bucket file dto and starts clamav scan. Add swagger documentation.
  @Post()
  scanFile(@Query() bucketFileDto: BucketFileDto): Promise<boolean> {
    return this.scannerService.scanFile(bucketFileDto);
  }
}
