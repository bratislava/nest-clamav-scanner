import { Controller, Query, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

/*
  DTOs
 */
import { QueryParamsDto } from './dto/query-params.dto';
import { IdDto } from './dto/id.dto';
import { UserDto } from './dto/user.dto';

/*
  Endpoints
 */
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Based on query params, you can obtain list of users ids',
    description: 'Obtain list of user ids',
  })
  @ApiBadRequestResponse({
    description: 'Bad request - incorrect query params',
  })
  @Get()
  findAll(@Query() queryParamsDto?: QueryParamsDto): Promise<IdDto[]> {
    return this.usersService.findAllUsers(queryParamsDto);
  }

  @ApiOperation({
    summary: 'Get info about user by its id',
  })
  @ApiBadRequestResponse({
    description: 'Bad request - incorrect query params',
  })
  @ApiNotFoundResponse({
    description: 'No user found for the user id ',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.getUser(id);
  }
}
