// src/modules/auth/dto/reset-password.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperación recibido por email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewPassword123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: 'NewPassword123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword: string;
}