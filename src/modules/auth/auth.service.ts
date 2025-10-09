import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { User, UserRole } from '../users/user.entity';
  import { Patient } from '../patients/patient.entity';
  import { RegisterPatientDto } from './dto/register-patient.dto';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Patient)
      private readonly patientRepository: Repository<Patient>,
      private readonly jwtService: JwtService,
    ) {}
  
    async registerPatient(
      registerDto: RegisterPatientDto,
    ): Promise<{ user: User; patient: Patient; access_token: string }> {
      const { email, password, ...patientData } = registerDto;
  
      // Verificar si el username (email) ya existe
      const existingUser = await this.userRepository.findOne({
        where: { username: email }, // ← username es el email
      });
  
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
  
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear el User
      const user = this.userRepository.create({
        username: email, // ← username = email
        password: hashedPassword,
        role: UserRole.PATIENT,
      });
  
      try {
        await this.userRepository.save(user);
      } catch (error) {
        throw new InternalServerErrorException('Error al crear el usuario');
      }
  
      // Crear el Patient
      const patient = this.patientRepository.create({
        ...patientData,
        email, // ← email va en Patient
        birthDate: new Date(patientData.birthDate),
        user, // Relación con User
      });
  
      try {
        await this.patientRepository.save(patient);
      } catch (error) {
        // Rollback: eliminar el user si falla la creación del patient
        await this.userRepository.remove(user);
        throw new InternalServerErrorException('Error al crear el paciente');
      }
  
      // Generar JWT
      const access_token = this.generateToken(user);
  
      return { user, patient, access_token };
    }
  
    async login(loginDto: LoginDto): Promise<string> {
      const { username, password } = loginDto;
  
      // Buscar usuario por username
      const user = await this.userRepository.findOne({
        where: { username },
      });
  
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
  
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
  
      return this.generateToken(user);
    }
  
    generateToken(user: User): string {
      const payload = {
        sub: user.id,
        username: user.username, // ← username en lugar de email
        role: user.role,
      };
  
      return this.jwtService.sign(payload);
    }
  
    async validateUser(userId: string): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['patients', 'doctors'], // ← Incluir relaciones si las necesitás
      });
  
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
  
      return user;
    }
  }