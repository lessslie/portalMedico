
// ============================================
// 📁 src/modules/patients/dto/create-dependent.dto.ts
// ============================================
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class CreateDependentDto {
  @ApiProperty({
    description: 'Nombre del dependiente',
    example: 'María',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del dependiente',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiProperty({
    description: 'Email del dependiente (opcional para menores)',
    example: 'maria.perez@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Teléfono del dependiente',
    example: '+5491112345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Dirección del dependiente',
    example: 'Av. Corrientes 1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '2015-05-20',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  birthDate: string;

  @ApiProperty({
    description: 'Obra social o seguro médico',
    example: 'OSDE',
    required: false,
  })
  @IsString()
  @IsOptional()
  insurance?: string;
}