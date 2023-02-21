import { Module } from '@nestjs/common';
import { ClamavClientService } from './clamav-client.service';
import { ConfigModule } from '@nestjs/config';
import { ClamavClientController } from './clamav-client.controller';

@Module({
  imports: [ConfigModule],
  providers: [ClamavClientService],
  exports: [ClamavClientService],
  controllers: [ClamavClientController],
})
export class ClamavClientModule {}
