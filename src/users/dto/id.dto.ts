import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdDto {
  @ApiProperty({
    description: 'user id',
    example: 'had7s69asd7a',
  })
  @IsString()
  id: string;
}
