import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches} from 'class-validator';

export class UpdateDoctorAvailabilityDto {
  @ApiPropertyOptional({
    example: 'monday',
    description: 'Day of the week (e.g. monday, tuesday, etc.)',
  })
  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Start time in 24h HH:mm format',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format (e.g. 09:00)',
  })
  startTime?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'End time in 24h HH:mm format',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format (e.g. 17:00)',
  })
  endTime?: string;
}
