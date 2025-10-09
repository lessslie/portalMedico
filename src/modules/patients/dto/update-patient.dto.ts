// ============================================
// 📁 src/modules/patients/dto/update-patient.dto.ts
// ============================================
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class UpdatePatientDto {
  @ApiProperty({
    description: 'Nombre del paciente',
    example: 'Juan',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del paciente',
    example: 'Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Email del paciente',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Teléfono del paciente',
    example: '+5491112345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Dirección del paciente',
    example: 'Av. Corrientes 1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Obra social o seguro médico',
    example: 'OSDE',
    required: false,
  })
  @IsString()
  @IsOptional()
  insurance?: string;
}
