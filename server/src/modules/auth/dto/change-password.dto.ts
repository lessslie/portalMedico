// src/modules/auth/dto/change-password.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'Password123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  currentPassword: string;

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