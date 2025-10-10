import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../appointment.entity';
import { Type } from 'class-transformer';

export class FilterAppointmentsDto {
  @ApiPropertyOptional({
    description: 'Filter appointments by patient ID',
    example: '9c1d0d3b-7a2b-4b0e-945f-23a2e894a93d',
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter appointments by doctor ID',
    example: '2b734f8b-0f3b-4b79-aee1-74373b62ab4a',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by appointment type (in-person or virtual)',
    enum: AppointmentType,
    example: AppointmentType.VIRTUAL,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Filter appointments starting from this date (ISO format)',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter appointments ending before this date (ISO format)',
    example: '2025-10-10T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    example: 10,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination)',
    example: 0,
  })
  @Type(() => Number)
  @IsOptional()
  offset?: number;
}
