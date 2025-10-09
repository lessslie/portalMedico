import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Patient } from './patient.entity';
  import { User } from '../users/user.entity';
  import { UpdatePatientDto } from './dto/update-patient.dto';
  import { CreateDependentDto } from './dto/create-dependent.dto';
  import {
    PatientResponseData,
    MyFamilyResponse,
  } from './interfaces/patient-response.interface';
  
  @Injectable()
  export class PatientsService {
    constructor(
      @InjectRepository(Patient)
      private readonly patientRepository: Repository<Patient>,
    ) {}
  
    /**
     * Encuentra el patient principal (isPrimary=true) de un usuario
     */
    async findPrimaryByUserId(userId: string): Promise<Patient> {
      const patient = await this.patientRepository.findOne({
        where: { user: { id: userId }, isPrimary: true },
        relations: ['user'],
      });
  
      if (!patient) {
        throw new NotFoundException(
          'No se encontró un paciente principal para este usuario',
        );
      }
  
      return patient;
    }
  
    /**
     * Encuentra un patient por ID (para admin/doctor)
     */
    async findOne(id: string): Promise<Patient> {
      const patient = await this.patientRepository.findOne({
        where: { id },
        relations: ['user', 'appointments', 'records'],
      });
  
      if (!patient) {
        throw new NotFoundException(`Paciente con id ${id} no encontrado`);
      }
  
      return patient;
    }
  
    /**
     * Encuentra todos los patients (admin/doctor)
     */
    async findAll(): Promise<Patient[]> {
      return this.patientRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    }
  
    /**
     * Actualiza el perfil del patient principal del usuario
     */
    async updateMyProfile(
      userId: string,
      updateDto: UpdatePatientDto,
    ): Promise<Patient> {
      const patient = await this.findPrimaryByUserId(userId);
  
      // Validar que el email no esté en uso por otro patient
      if (updateDto.email && updateDto.email !== patient.email) {
        const existingPatient = await this.patientRepository.findOne({
          where: { email: updateDto.email },
        });
  
        if (existingPatient && existingPatient.id !== patient.id) {
          throw new BadRequestException('El email ya está en uso');
        }
      }
  
      // Actualizar campos
      Object.assign(patient, {
        ...updateDto,
        birthDate: updateDto.birthDate
          ? new Date(updateDto.birthDate)
          : patient.birthDate,
      });
  
      try {
        return await this.patientRepository.save(patient);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error al actualizar el paciente',
        );
        console.log(error);
      }
    }
  
    /**
     * Actualiza un patient específico (admin)
     */
    async update(id: string, updateDto: UpdatePatientDto): Promise<Patient> {
      const patient = await this.findOne(id);
  
      // Validar que el email no esté en uso por otro patient
      if (updateDto.email && updateDto.email !== patient.email) {
        const existingPatient = await this.patientRepository.findOne({
          where: { email: updateDto.email },
        });
  
        if (existingPatient && existingPatient.id !== patient.id) {
          throw new BadRequestException('El email ya está en uso');
        }
      }
  
      Object.assign(patient, {
        ...updateDto,
        birthDate: updateDto.birthDate
          ? new Date(updateDto.birthDate)
          : patient.birthDate,
      });
  
      try {
        return await this.patientRepository.save(patient);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error al actualizar el paciente',
        );
        console.log(error);
      }
    }
  
    /**
     * Crea un dependiente (hijo, cónyuge, etc.) vinculado al user
     */
    async createDependent(
      userId: string,
      createDto: CreateDependentDto,
    ): Promise<Patient> {
      // Verificar que el usuario tenga un patient principal
      const primaryPatient = await this.findPrimaryByUserId(userId);
  
      if (!primaryPatient) {
        throw new BadRequestException(
          'Debes tener un perfil de paciente antes de agregar dependientes',
        );
      }
  
      // Validar que el email no esté en uso (si se proporciona)
      if (createDto.email) {
        const existingPatient = await this.patientRepository.findOne({
          where: { email: createDto.email },
        });
  
        if (existingPatient) {
          throw new BadRequestException('El email ya está en uso');
        }
      }
  
      // Crear el dependiente
      const dependent = this.patientRepository.create({
        ...createDto,
        birthDate: new Date(createDto.birthDate),
        user: { id: userId } as User,
        isPrimary: false, // 🔑 Importante: marcar como dependiente
      });
  
      try {
        return await this.patientRepository.save(dependent);
      } catch (error) {
        throw new InternalServerErrorException('Error al crear el dependiente');
            console.log(error);
      }
    }
  
    /**
     * Obtiene el patient principal y sus dependientes
     */
    async findMyFamily(userId: string): Promise<MyFamilyResponse> {
      const allPatients = await this.patientRepository.find({
        where: { user: { id: userId } },
        order: { isPrimary: 'DESC', createdAt: 'ASC' },
      });
  
      const primary = allPatients.find((p) => p.isPrimary);
      const dependents = allPatients.filter((p) => !p.isPrimary);
  
      if (!primary) {
        throw new NotFoundException(
          'No se encontró un paciente principal para este usuario',
        );
      }
  
      return {
        primary: this.sanitizePatientData(primary),
        dependents: dependents.map((d) => this.sanitizePatientData(d)),
      };
    }
  
    /**
     * Sanitiza los datos del patient (elimina relaciones innecesarias)
     */
    private sanitizePatientData(patient: Patient): PatientResponseData {
      return {
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
      };
    }
  }