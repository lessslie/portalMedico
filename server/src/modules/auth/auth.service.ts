// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { Patient } from '../patients/patient.entity';
import { EmailService } from '../email/email.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';

interface PasswordResetPayload {
  sub: string;
  email: string;
  type: 'password-reset';
}
interface DoctorActivationPayload {
  sub: string;
  email: string;
  type: 'doctor-activation';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async registerPatient(
    registerDto: RegisterPatientDto,
  ): Promise<{ user: User; patient: Patient; access_token: string }> {
    const { email, password, ...patientData } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { username: email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username: email,
      password: hashedPassword,
      role: UserRole.PATIENT,
    });

    try {
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    const patient = this.patientRepository.create({
      ...patientData,
      birthDate: new Date(patientData.birthDate),
      user,
      isPrimary: true,
    });

    try {
      await this.patientRepository.save(patient);
    } catch {
      await this.userRepository.remove(user);
      throw new InternalServerErrorException('Error al crear el paciente');
    }

    const access_token = this.generateToken(user);

    return { user, patient, access_token };
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar que tenga password (doctors sin activar no tienen)
    if (!user.password) {
      throw new UnauthorizedException(
        'Tu cuenta aún no ha sido activada. Por favor, revisa tu email.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateToken(user);
  }

  /**
   * NUEVO: Doctor activa su cuenta y establece contraseña
   */
  async activateAccount(
    activateDto: ActivateAccountDto,
  ): Promise<{ message: string; access_token: string }> {
    const { token, password, confirmPassword } = activateDto;

    // 1️⃣ Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2️⃣ Verificar y decodificar el token
    let payload: DoctorActivationPayload;
    try {
      payload = this.jwtService.verify<DoctorActivationPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'El token es inválido o ha expirado. Por favor, contacta al administrador para obtener un nuevo link de activación.',
      );
    }

    // 3️⃣ Verificar que sea un token de tipo doctor-activation
    if (payload.type !== 'doctor-activation') {
      throw new UnauthorizedException('Token inválido');
    }

    // 4️⃣ Buscar el usuario
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['doctor'], // ← Importante: cargar relación doctor
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 5️⃣ Validar que sea un doctor
    if (user.role !== UserRole.DOCTOR) {
      throw new UnauthorizedException(
        'Este token es solo para activación de cuentas de doctores',
      );
    }

    // 6️⃣ Validar que no haya sido activado previamente
    if (user.isActive && user.password) {
      throw new BadRequestException(
        'Esta cuenta ya fue activada. Puedes iniciar sesión normalmente.',
      );
    }

    // 7️⃣ Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8️⃣ Actualizar usuario (activar + establecer password)
    user.password = hashedPassword;
    user.isActive = true;

    try {
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error al activar la cuenta');
    }

    // 9️⃣ Generar token de sesión
    const access_token = this.generateToken(user);

    this.logger.log(
      ` Cuenta de doctor activada: ${user.username} (ID: ${user.id})`,
    );

    return {
      message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.',
      access_token,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { username: email },
    });

    // Por seguridad, siempre devolvemos el mismo mensaje
    // para no revelar si el email existe o no
    if (!user) {
      return {
        message:
          'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña',
      };
    }

    // Generar token de reseteo (válido por 1 hora)
    const resetToken = this.generatePasswordResetToken(user);

    // Obtener nombre del paciente para personalizar el email
    let userName: string | undefined;
    try {
      const patient = await this.patientRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (patient) {
        userName = patient.firstName;
      }
    } catch {
      this.logger.warn('No se pudo obtener el nombre del paciente');
    }

    // Enviar email con el token
    try {
      const emailResult = await this.emailService.sendPasswordResetEmail({
        to: user.username,
        token: resetToken,
        userName,
      });

      if (emailResult.success) {
        this.logger.log(`✅ Email de recuperación enviado a: ${user.username}`);
      } else {
        this.logger.warn(
          `⚠️ No se pudo enviar el email a: ${user.username}. Error: ${emailResult.error}`,
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(
        'Error al intentar enviar email de recuperación:',
        errorMessage,
      );
    }

    return {
      message:
        'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Verificar y decodificar el token
    let payload: PasswordResetPayload;
    try {
      payload = this.jwtService.verify<PasswordResetPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'El token es inválido o ha expirado. Por favor, solicita uno nuevo.',
      );
    }

    // Verificar que sea un token de tipo password-reset
    if (payload.type !== 'password-reset') {
      throw new UnauthorizedException('Token inválido');
    }

    // Buscar el usuario
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    user.password = hashedPassword;

    try {
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar la contraseña',
      );
    }

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } =
      changePasswordDto;

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas nuevas no coinciden');
    }

    // Validar que la contraseña nueva sea diferente a la actual
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    // Buscar el usuario
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (!user.password) {
      throw new UnauthorizedException(
        'La cuenta no tiene contraseña configurada',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    // Verificar la contraseña actual
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    user.password = hashedPassword;

    try {
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar la contraseña',
      );
    }

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private generatePasswordResetToken(user: User): string {
    const payload: PasswordResetPayload = {
      sub: user.id,
      email: user.username,
      type: 'password-reset',
    };

    // Token válido por 1 hora
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }


  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['patients', 'doctor'], // ← 'doctor' singular (OneToOne)
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}