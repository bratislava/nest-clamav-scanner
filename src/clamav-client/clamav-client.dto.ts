import { ApiProperty } from '@nestjs/swagger';

//create dto for bucket file with file id and bucket id as optional. Add swagger documentation.
export class RunningClamavDto {
  @ApiProperty({
    description: 'is clamav running?',
    example: 'true',
  })
  running: boolean;
}
