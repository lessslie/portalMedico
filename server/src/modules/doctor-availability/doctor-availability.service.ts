import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorAvailability } from './doctor-availability.entity';
import { UpdateDoctorAvailabilityDto } from './dtos/update-availability.dto';
import { CreateDoctorAvailabilityDto } from './dtos/create-availability.dto';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // 🧩 Crear disponibilidad para un día específico
  async create(
    doctorId: string,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    this.validateTimeRange(dto.startTime, dto.endTime);

    const existing = await this.availabilityRepo.findOne({
      where: { doctor: { id: doctorId }, dayOfWeek: dto.dayOfWeek },
    });

    if (existing)
      throw new BadRequestException(
        `Availability for ${dto.dayOfWeek} already exists`,
      );

    const availability = this.availabilityRepo.create({
      ...dto,
      doctor,
    });

    return this.availabilityRepo.save(availability);
  }

  // 📦 Crear disponibilidades en bloque (por ejemplo: lunes a viernes)
  async createBulk(
    doctorId: string,
    dtos: CreateDoctorAvailabilityDto[],
  ): Promise<DoctorAvailability[]> {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Validamos duplicados dentro del mismo request
    const days = dtos.map((d) => d.dayOfWeek.toLowerCase());
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
      throw new BadRequestException(
        'Duplicate dayOfWeek values are not allowed in bulk creation',
      );
    }

    // Validar horarios y evitar duplicados ya existentes
    const existing = await this.availabilityRepo.find({
      where: { doctor: { id: doctorId }, dayOfWeek: In(days) },
    });
    if (existing.length > 0) {
      const existingDays = existing.map((e) => e.dayOfWeek).join(', ');
      throw new BadRequestException(
        `Availabilities already exist for: ${existingDays}`,
      );
    }

    // Validar rangos horarios y crear entidades
    const availabilities = dtos.map((dto) => {
      this.validateTimeRange(dto.startTime, dto.endTime);
      return this.availabilityRepo.create({ ...dto, doctor });
    });

    return this.availabilityRepo.save(availabilities);
  }

  // 📄 Obtener todas las disponibilidades de un doctor
  async findAllByDoctor(doctorId: string): Promise<DoctorAvailability[]> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
      relations: ['availabilities'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor.availabilities;
  }

  // ✏️ Actualizar disponibilidad
  async update(
    id: string,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const availability = await this.availabilityRepo.findOne({ where: { id } });
    if (!availability) throw new NotFoundException('Availability not found');

    if (dto.startTime && dto.endTime) {
      this.validateTimeRange(dto.startTime, dto.endTime);
    }

    Object.assign(availability, dto);
    return this.availabilityRepo.save(availability);
  }

  // ❌ Eliminar disponibilidad
  async remove(id: string): Promise<void> {
    const availability = await this.availabilityRepo.findOne({ where: { id } });
    if (!availability) throw new NotFoundException('Availability not found');
    await this.availabilityRepo.remove(availability);
  }

  // 🕒 Validación de rango horario coherente
  private validateTimeRange(startTime: string, endTime: string): void {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }
}
