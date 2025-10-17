import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID of the patient associated with the appointment',
    example: '9c1d0d3b-7a2b-4b0e-945f-23a2e894a93d',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'UUID of the doctor assigned to the appointment',
    example: '2b734f8b-0f3b-4b79-aee1-74373b62ab4a',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Start time of the appointment (ISO 8601 format)',
    example: '2025-10-08T10:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the appointment (ISO 8601 format)',
    example: '2025-10-08T10:30:00.000Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Type of appointment (in-person or virtual)',
    enum: AppointmentType,
    example: AppointmentType.IN_PERSON,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Additional notes about the appointment',
    example: 'Follow-up consultation for blood test results',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
