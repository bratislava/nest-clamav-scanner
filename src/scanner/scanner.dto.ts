import { ApiProperty } from '@nestjs/swagger';

//dto for bucket file with file id and bucket id as optional. Add swagger documentation.
export class BucketFileDto {
  @ApiProperty({
    description: 'uid of the file',
    example: 'ffsdfsd89796',
  })
  fileUid: string;

  @ApiProperty({
    description: 'uid of the bucket',
    example: 'ffsdfsd89796',
  })
  bucketUid: string;
}

//dto for scan result with file id, bucket id, user id as optional and scan result. Add swagger documentation.
export class ScanStatusDto {
  @ApiProperty({
    description: 'uid of the file',
    example: 'ffsdfsd89796',
  })
  fileUid: string;

  @ApiProperty({
    description: 'uid of the bucket',
    example: 'ffsdfsd89796',
  })
  bucketUid: string;

  @ApiProperty({
    description: 'uid of the user',
    example: 'ffsdfsd89796',
  })
  userUid: string;

  //api property for scan status as enum NEW, QUEUE, SCANNING, DONE, ERROR
  @ApiProperty({
    description: 'scan result',
    enum: ['ACCEPTED', 'QUEUE', 'SCANNING', 'DONE', 'ERROR'],
    example: 'ACCEPTED',
  })
  status: string;

  //api property for created at
  @ApiProperty({
    description: 'created at',
    example: '2021-05-05T12:00:00.000Z',
  })
  createdAt: Date;

  //api property for updated at
  @ApiProperty({
    description: 'updated at',
    example: '2021-05-05T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class ScanFileResponseDto {
  @ApiProperty({
    description: 'scan result',
    enum: ['ACCEPTED', 'ERROR'],
    example: 'ACCEPTED',
  })
  status: string;

  @ApiProperty({
    description: 'more info',
    example: 'file is queued for scanning',
  })
  message: string;
}
