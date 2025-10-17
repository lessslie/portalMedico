import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../appointment.entity';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Updated start time of the appointment (ISO 8601 format)',
    example: '2025-10-09T09:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Updated end time of the appointment (ISO 8601 format)',
    example: '2025-10-09T09:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.COMPLETED,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Updated type of the appointment (in-person or virtual)',
    enum: AppointmentType,
    example: AppointmentType.VIRTUAL,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Updated notes or remarks about the appointment',
    example: 'Changed to virtual consultation due to patient request',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
