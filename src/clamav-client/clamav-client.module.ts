import { Module } from '@nestjs/common';
import { ClamavClientService } from './clamav-client.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ClamavClientService],
  exports: [ClamavClientService],
})
export class ClamavClientModule {}
