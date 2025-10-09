import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Param,
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
  import { PatientsService } from './patients.service';
  import { UpdatePatientDto } from './dto/update-patient.dto';
  import { CreateDependentDto } from './dto/create-dependent.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/user.entity';
  
  interface AuthenticatedRequest extends Express.Request {
    user: {
      userId: string;
      username: string;
      role: string;
    };
  }
  
  @ApiTags('patients')
  @Controller('patients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  export class PatientsController {
    constructor(private readonly patientsService: PatientsService) {}
  
    // ============================================
    // 👤 ENDPOINTS PARA PACIENTES
    // ============================================
  
    @Get('me')
    @Roles(UserRole.PATIENT)
    @ApiOperation({
      summary: 'Obtener mi perfil de paciente',
      description:
        'El paciente autenticado puede ver su perfil principal (isPrimary=true)',
    })
    @ApiResponse({
      status: 200,
      description: 'Perfil del paciente obtenido exitosamente',
    })
    @ApiResponse({
      status: 404,
      description: 'No se encontró un paciente para este usuario',
    })
    async getMyProfile(@Request() req: AuthenticatedRequest) {
      const patient = await this.patientsService.findPrimaryByUserId(
        req.user.userId,
      );
  
      return {
        message: 'Perfil obtenido exitosamente',
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          birthDate: patient.birthDate,
          insurance: patient.insurance,
          isPrimary: patient.isPrimary,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
      };
    }
  
    @Put('me')
    @Roles(UserRole.PATIENT)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Actualizar mi perfil de paciente',
      description: 'El paciente puede actualizar sus datos personales',
    })
    @ApiResponse({
      status: 200,
      description: 'Perfil actualizado exitosamente',
    })
    @ApiResponse({
      status: 400,
      description: 'El email ya está en uso',
    })
    async updateMyProfile(
      @Request() req: AuthenticatedRequest,
      @Body() updateDto: UpdatePatientDto,
    ) {
      const patient = await this.patientsService.updateMyProfile(
        req.user.userId,
        updateDto,
      );
  
      return {
        message: 'Perfil actualizado exitosamente',
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          birthDate: patient.birthDate,
          insurance: patient.insurance,
        },
      };
    }
  
    @Get('my-family')
    @Roles(UserRole.PATIENT)
    @ApiOperation({
      summary: 'Obtener mi familia (titular + dependientes)',
      description:
        'El paciente puede ver su perfil principal y todos sus dependientes (hijos, cónyuge, etc.)',
    })
    @ApiResponse({
      status: 200,
      description: 'Familia obtenida exitosamente',
    })
    async getMyFamily(@Request() req: AuthenticatedRequest) {
      const family = await this.patientsService.findMyFamily(req.user.userId);
  
      return {
        message: 'Familia obtenida exitosamente',
        ...family,
      };
    }
  
    @Post()
    @Roles(UserRole.PATIENT)
    @ApiOperation({
      summary: 'Crear un dependiente (hijo, cónyuge, etc.)',
      description:
        'El paciente puede agregar dependientes vinculados a su cuenta. Los dependientes no tienen email obligatorio (útil para menores).',
    })
    @ApiResponse({
      status: 201,
      description: 'Dependiente creado exitosamente',
    })
    @ApiResponse({
      status: 400,
      description: 'El email ya está en uso o el usuario no tiene perfil',
    })
    async createDependent(
      @Request() req: AuthenticatedRequest,
      @Body() createDto: CreateDependentDto,
    ) {
      const dependent = await this.patientsService.createDependent(
        req.user.userId,
        createDto,
      );
  
      return {
        message: 'Dependiente creado exitosamente',
        dependent: {
          id: dependent.id,
          firstName: dependent.firstName,
          lastName: dependent.lastName,
          email: dependent.email,
          phone: dependent.phone,
          address: dependent.address,
          birthDate: dependent.birthDate,
          insurance: dependent.insurance,
          isPrimary: dependent.isPrimary,
        },
      };
    }
  
    // ============================================
    // 🔐 ENDPOINTS PARA ADMIN/DOCTOR
    // ============================================
  
    @Get()
    @Roles(UserRole.ADMIN, UserRole.DOCTOR)
    @ApiOperation({
      summary: 'Listar todos los pacientes',
      description: 'Solo admin y doctores pueden ver todos los pacientes',
    })
    @ApiResponse({
      status: 200,
      description: 'Lista de pacientes obtenida exitosamente',
    })
    async findAll() {
      const patients = await this.patientsService.findAll();
  
      return {
        message: 'Pacientes obtenidos exitosamente',
        total: patients.length,
        patients: patients.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          birthDate: p.birthDate,
          isPrimary: p.isPrimary,
          user: {
            id: p.user.id,
            username: p.user.username,
            role: p.user.role,
          },
        })),
      };
    }
  
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DOCTOR)
    @ApiOperation({
      summary: 'Obtener un paciente por ID',
      description: 'Solo admin y doctores pueden ver detalles de cualquier paciente',
    })
    @ApiResponse({
      status: 200,
      description: 'Paciente obtenido exitosamente',
    })
    @ApiResponse({
      status: 404,
      description: 'Paciente no encontrado',
    })
    async findOne(@Param('id') id: string) {
      const patient = await this.patientsService.findOne(id);
  
      return {
        message: 'Paciente obtenido exitosamente',
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          birthDate: patient.birthDate,
          insurance: patient.insurance,
          isPrimary: patient.isPrimary,
          user: {
            id: patient.user.id,
            username: patient.user.username,
            role: patient.user.role,
          },
          appointmentsCount: patient.appointments?.length || 0,
          recordsCount: patient.records?.length || 0,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
      };
    }
  
    @Put(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Actualizar un paciente (solo admin)',
      description: 'Solo admin puede actualizar cualquier paciente',
    })
    @ApiResponse({
      status: 200,
      description: 'Paciente actualizado exitosamente',
    })
    @ApiResponse({
      status: 404,
      description: 'Paciente no encontrado',
    })
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdatePatientDto,
    ) {
      const patient = await this.patientsService.update(id, updateDto);
  
      return {
        message: 'Paciente actualizado exitosamente',
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          birthDate: patient.birthDate,
          insurance: patient.insurance,
        },
      };
    }
  }