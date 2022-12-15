import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'id of the user',
    example: 'ffsdfsd89796',
  })
  id: string;

  @ApiProperty({
    description: 'user public name',
    example: 'Chuck',
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'gmail@chucknorris.com',
  })
  email: string;
}
