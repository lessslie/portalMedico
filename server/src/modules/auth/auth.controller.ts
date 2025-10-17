// src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './interfaces/auth.interface';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../users/user.entity';
import { Roles } from './decorators/roles.decorator';
import { ActivateAccountDto } from './dto/activate-account.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register/patient')
  @ApiOperation({ summary: 'Registrar un nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente registrado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  async registerPatient(@Body() registerDto: RegisterPatientDto) {
    const { user, patient, access_token } =
      await this.authService.registerPatient(registerDto);

    return {
      message: 'Paciente registrado exitosamente',
      access_token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.user.username,
        phone: patient.phone,
      },
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    const access_token = await this.authService.login(loginDto);

    return {
      message: 'Login exitoso',
      access_token,
    };
  }

  @Post('activate-account')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Activar cuenta de doctor y establecer contraseña',
  description:
    'Usa el token recibido por email para activar tu cuenta de doctor y establecer tu contraseña. El token es válido por 7 días.',
})
@ApiResponse({
  status: 200,
  description:
    'Cuenta activada exitosamente. Puedes iniciar sesión con tus credenciales.',
})
@ApiResponse({
  status: 400,
  description:
    'Las contraseñas no coinciden o la cuenta ya fue activada previamente.',
})
@ApiResponse({
  status: 401,
  description: 'Token inválido o expirado.',
})
async activateAccount(@Body() activateDto: ActivateAccountDto) {
  return await this.authService.activateAccount(activateDto);
  //              ^^^ authService, NO usersService
}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.validateUser(req.user.userId);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un email con instrucciones para recuperar la contraseña. Por seguridad, siempre devuelve el mismo mensaje independientemente de si el email existe o no.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitud procesada. Si el email existe, recibirá instrucciones.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con token',
    description:
      'Usa el token recibido por email para establecer una nueva contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Las contraseñas no coinciden',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }



  @Roles(UserRole.PATIENT)
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar contraseña (usuario autenticado)',
    description:
      'Permite a un usuario autenticado cambiar su contraseña proporcionando la contraseña actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Las contraseñas no coinciden o son inválidas',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado o contraseña actual incorrecta',
  })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      req.user.userId,
      changePasswordDto,
    );
  }
}