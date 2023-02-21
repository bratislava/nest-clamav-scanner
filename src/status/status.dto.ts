import { ApiProperty } from '@nestjs/swagger';

//dto for bucket file with file id and bucket id as optional.
export class MinioRunningDto {
  @ApiProperty({
    description: 'is minio running?',
    example: 'true',
  })
  running: boolean;
}

//dto for clamav version.
export class MinioVersionDto {
  @ApiProperty({
    description: 'minio version',
    example: '0.102.4',
  })
  version: string;
}

export class ClamavRunningDto {
  @ApiProperty({
    description: 'is clamav running?',
    example: 'true',
  })
  running: boolean;
}

//dto for clamav version.
export class ClamavVersionDto {
  @ApiProperty({
    description: 'clamav version',
    example: '0.102.4',
  })
  version: string;
}
