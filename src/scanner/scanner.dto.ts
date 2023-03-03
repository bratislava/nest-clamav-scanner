import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsNumber, IsOptional, IsString} from 'class-validator'; //dto for bucket file with file id and bucket id as optional. Add swagger documentation.

//dto for bucket file with file id and bucket id as optional. Add swagger documentation.
export class ScanFileDto {
  @ApiProperty({
    description: 'uid/name of the file ',
    example: 'ffsdfsd89796.pdf',
  })
  @IsString()
  fileUid: string;

  @ApiProperty({
    description:
      'uid/name of the bucket. If not set, default bucket will be used',
    example: 'super-bucket',
  })
  @IsString()
  @IsOptional()
  bucketUid?: string;

  // optional property for user id
  @ApiProperty({
    description:
      'uid/name of the user which will be saved together with the file to db',
    example: 'super-user',
  })
  @IsString()
  @IsOptional()
  userUid?: string;
}

//dto for scan result with file id, bucket id, user id as optional and scan result. Add swagger documentation.
export class ScanStatusDto {
  @ApiProperty({
    description: 'uid/name of the file',
    example: 'ffsdfsd89796',
  })
  @IsString()
  fileUid: string;

  @ApiProperty({
    description: 'uid of the bucket',
    example: 'ffsdfsd89796',
  })
  @IsString()
  bucketUid: string;

  @ApiProperty({
    description: 'uid of the user',
    example: 'ffsdfsd89796',
  })
  @IsString()
  @IsOptional()
  userUid?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: '123131',
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: 'File mime type of file',
    example: 'application/pdf',
  })
  @IsString()
  fileMimeType: string;

  @ApiProperty({
    description: 'scan result',
    enum: [
      'ACCEPTED',
      'QUEUE',
      'SCANNING',
      'INFECTED',
      'SAFE',
      'NOT FOUND',
      'MOVE ERROR',
      'SCAN ERROR',
    ],
    example: 'ACCEPTED',
  })
  @IsEnum([
    'ACCEPTED',
    'QUEUE',
    'SCANNING',
    'INFECTED',
    'SAFE',
    'NOT FOUND',
    'MOVE ERROR',
    'SCAN ERROR',
  ])
  status: string;

  @ApiProperty({
    description: 'other meta data',
    example: '{ "type": "TIE Fighter"}',
  })
  @IsOptional()
  meta?: any;

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
  @IsEnum(['ACCEPTED', 'ERROR'])
  status: string;

  @ApiProperty({
    description: 'more info',
    example: 'file is queued for scanning',
  })
  @IsString()
  message: string;

  //id of the record in db
  @ApiProperty({
    description: 'id of the record in db',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8',
  })
  @IsString()
  id: string;
}
