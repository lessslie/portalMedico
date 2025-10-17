import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateDoctorAvailabilityDto {
  @ApiProperty({ example: 'monday' })
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}
