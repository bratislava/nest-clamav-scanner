import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const SortBy = ['asc', 'desc'] as const;
type SortByType = typeof SortBy[number];

export class QueryParamsDto {
  @ApiProperty({
    description: 'user name',
    example: 'Chuck',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Sort by asc, desc',
    example: 'asc',
    enum: SortBy,
  })
  @IsOptional()
  @IsIn(SortBy)
  @IsString()
  sortBy?: SortByType;

  @ApiProperty({
    description: 'Order by some attribute',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}
