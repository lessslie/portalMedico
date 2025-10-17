// src/modules/admin/dto/create-doctor.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Email del doctor (se usará como username)',
    example: 'dr.gonzalez@hospital.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Nombre del doctor',
    example: 'Carlos',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del doctor',
    example: 'González',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiProperty({
    description: 'Especialidad médica',
    example: 'Cardiología',
  })
  @IsString()
  @IsNotEmpty({ message: 'La especialidad es requerida' })
  specialty: string;

  @ApiProperty({
    description: 'Número de matrícula profesional',
    example: 'MN-12345',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de matrícula es requerido' })
  @MinLength(3, { message: 'La matrícula debe tener al menos 3 caracteres' })
  licenseNumber: string;

  @ApiProperty({
    description: 'Teléfono del doctor',
    example: '+5491112345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}