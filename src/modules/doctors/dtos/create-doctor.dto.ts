import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  specialty: string;

  @ApiProperty()
  @IsString()
  @Length(5, 50)
  licenseNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  phone?: string;
}
