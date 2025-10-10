// src/modules/admin/admin.controller.ts

import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { AdminService } from './admin.service';
  import { CreateDoctorDto } from './dto/create-doctor.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/user.entity';
  
  @ApiTags('admin')
  @Controller('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    @Post('doctors')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
      summary: 'Crear cuenta de doctor (solo admin)',
      description:
        'Admin crea una cuenta de doctor. Se envía un email con un link de activación. El doctor debe activar su cuenta y establecer su contraseña dentro de 7 días.',
    })
    @ApiResponse({
      status: 201,
      description:
        'Doctor creado exitosamente. Email de activación enviado (o advertencia si falló el envío).',
    })
    @ApiResponse({
      status: 409,
      description: 'El email o número de matrícula ya están registrados.',
    })
    @ApiResponse({
      status: 403,
      description: 'Acceso denegado - solo admin puede crear doctors.',
    })
    async createDoctor(@Body() createDto: CreateDoctorDto) {
      return await this.adminService.createDoctor(createDto);
    }
  
    @Get('doctors/pending')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
      summary: 'Listar doctors con cuenta pendiente de activación (solo admin)',
      description:
        'Obtiene todos los doctors que fueron creados pero aún no activaron su cuenta.',
    })
    @ApiResponse({
      status: 200,
      description: 'Lista de doctors pendientes obtenida exitosamente.',
    })
    @ApiResponse({
      status: 403,
      description: 'Acceso denegado - solo admin.',
    })
    async findPendingDoctors() {
      return await this.adminService.findPendingDoctors();
    }
  }