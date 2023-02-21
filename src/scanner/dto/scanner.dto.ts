import { ApiProperty } from '@nestjs/swagger';

//create dto for bucket file with file id and bucket id as optional. Add swagger documentation.
export class BucketFileDto {
    @ApiProperty({
        description: 'id of the file',
        example: 'ffsdfsd89796',
    })
    fileId: string;

    @ApiProperty({
        description: 'id of the bucket',
        example: 'ffsdfsd89796',
    })
    bucketId: string;
}
