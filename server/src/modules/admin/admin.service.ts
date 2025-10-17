// src/modules/admin/admin.service.ts

import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import {
  DoctorCreatedResponse,
  PendingDoctorsListResponse,
  PendingDoctorResponse,
} from './interfaces/admin.interface';
import { ConfigService } from '@nestjs/config';

interface ActivationTokenPayload {
  sub: string;
  email: string;
  type: 'doctor-activation';
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Admin crea una cuenta de doctor
   * - Crea User con role=DOCTOR, password=null, isActive=false
   * - Crea Doctor vinculado al User (sin campo email)
   * - Envía email con token de activación
   */
  async createDoctor(
    createDto: CreateDoctorDto,
  ): Promise<DoctorCreatedResponse> {
    const { email, firstName, lastName, specialty, licenseNumber, phone } =
      createDto;

    // 1️⃣ Validar que el email no exista
    const existingUser = await this.userRepository.findOne({
      where: { username: email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este email. Si es un doctor que no activó su cuenta, contacte con soporte.',
      );
    }

    // 2️⃣ Validar que el licenseNumber no exista
    const existingDoctor = await this.doctorRepository.findOne({
      where: { licenseNumber },
    });

    if (existingDoctor) {
      throw new ConflictException(
        'Ya existe un doctor con este número de matrícula',
      );
    }

    // 3️⃣ Crear User (sin password, inactivo)(xq es un doctor sin activar)
    const user = this.userRepository.create({
      username: email,
      password: undefined,
      role: UserRole.DOCTOR,
      isActive: false,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.error('Error al crear el usuario', error);
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    // 4️⃣ Crear Doctor usando TypeORM (sin SQL raw) y vincularlo al User
    const doctor = this.doctorRepository.create({
      firstName,
      lastName,
      specialty,
      licenseNumber,
      phone, // TypeScript maneja undefined automáticamente
      user,
    });

    try {
      await this.doctorRepository.save(doctor);
    } catch (error) {
      // Rollback: eliminar user si falla la creación del doctor
      await this.userRepository.remove(user);
      this.logger.error('Error al crear el doctor', error);
      throw new InternalServerErrorException('Error al crear el doctor');
    }

    // 5️⃣ Generar token de activación (válido 7 días)
    const activationToken = this.generateActivationToken(user);

    // 🔍 LOGGING SIEMPRE (para debugging)
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:4200';
    const activationUrl = `${frontendUrl}/activate-account?token=${activationToken}`;
    this.logger.log('═══════════════════════════════════════');
    this.logger.log(`📧 Email destino: ${email}`);
    this.logger.log(`👤 Doctor: ${firstName} ${lastName}`);
    this.logger.log(`🔑 Token de activación:`);
    this.logger.log(activationToken);
    this.logger.log(`🔗 Link completo:`);
    this.logger.log(activationUrl);
    this.logger.log('═══════════════════════════════════════');

    // 6️⃣ Enviar email de activación
    let emailSent = false;
    try {
      const emailResult = await this.emailService.sendDoctorActivationEmail({
        to: email,
        token: activationToken,
        doctorName: `${firstName} ${lastName}`,
      });

      emailSent = emailResult.success;

      if (emailResult.success) {
        this.logger.log(`✅ Email de activación enviado a: ${email}`);
      } else {
        this.logger.warn(
          `⚠️ No se pudo enviar el email a: ${email}. Error: ${emailResult.error}`,
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(
        'Error al intentar enviar email de activación:',
        errorMessage,
      );
    }

    // 7️⃣ Retornar respuesta
    return {
      message: emailSent
        ? 'Doctor creado exitosamente. Se envió un email de activación.'
        : 'Doctor creado exitosamente. ADVERTENCIA: No se pudo enviar el email de activación.',
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        phone: doctor.phone,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
        },
      },
      activationEmailSent: emailSent,
    };
  }

  /**
   * Lista todos los doctors con cuenta pendiente de activación
   */
  async findPendingDoctors(): Promise<PendingDoctorsListResponse> {
    const pendingUsers = await this.userRepository.find({
      where: {
        role: UserRole.DOCTOR,
        isActive: false,
      },
      relations: ['doctor'],
      order: { createdAt: 'ASC' },
    });

    const pendingDoctors: PendingDoctorResponse[] = pendingUsers
      .filter((user) => user.doctor)
      .map((user) => {
        const daysPending = Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: user.doctor!.id,
          firstName: user.doctor!.firstName,
          lastName: user.doctor!.lastName,
          specialty: user.doctor!.specialty,
          licenseNumber: user.doctor!.licenseNumber,
          email: user.username, // El Email viene de user.username
          createdAt: user.createdAt,
          daysPending,
        };
      });

    return {
      message: 'Doctors pendientes de activación obtenidos exitosamente',
      total: pendingDoctors.length,
      pendingDoctors,
    };
  }

  /**
   * Genera token JWT para activación de cuenta (válido 7 días)
   */
  private generateActivationToken(user: User): string {
    const payload: ActivationTokenPayload = {
      sub: user.id,
      email: user.username,
      type: 'doctor-activation',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}