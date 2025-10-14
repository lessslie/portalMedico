import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Doctor } from '../doctor.entity';

export class FilterDoctorsDto {
  @ApiPropertyOptional({ description: 'Filter by specialty' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Filter by first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Filter by last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;

  @ApiPropertyOptional({ enum: ['firstName', 'lastName', 'specialty'] })
  @IsOptional()
  @IsString()
  orderBy?: keyof Doctor;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
