import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateDoctorDto {
  @ApiProperty({ description: 'Doctor first name', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @ApiProperty({ description: 'Doctor last name', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @ApiProperty({ description: 'Medical specialty', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  specialty?: string;

  @ApiProperty({ description: 'License number', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
