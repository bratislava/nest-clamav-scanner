import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { isString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(queryParamsDto?: QueryParamsDto): Promise<any[]> {
    const preparedQuery = this.prepareQuery(queryParamsDto);

    return this.prisma.user.findMany({
      ...preparedQuery,
      select: {
        id: true,
      },
    });
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return users;
  }

  private prepareQuery(queryParamsDto?: QueryParamsDto) {
    if (
      !queryParamsDto ||
      !isString(queryParamsDto.sortBy) ||
      !isString(queryParamsDto.orderBy)
    ) {
      return {
        where: {},
        take: 20,
      };
    }

    const query = {
      where: {
        name: queryParamsDto.name,
        createdAt: {},
      },
      orderBy: {
        [queryParamsDto.orderBy]: queryParamsDto.sortBy,
      },
      take: 20,
    };

    return query;
  }
}
