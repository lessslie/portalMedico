import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/appointments-filter.dto';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { DoctorAvailability } from '../doctor-availability/doctor-availability.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>,
  ) {}

  // 🧩 Crear un nuevo turno validando disponibilidad
  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
    });
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });

    if (!patient) throw new NotFoundException('Patient not found');
    if (!doctor) throw new NotFoundException('Doctor not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    // 🕒 Verificar si cae dentro de disponibilidad
    const dayOfWeek = start.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const availability = await this.availabilityRepo.findOne({
      where: {
        doctor: { id: dto.doctorId },
        dayOfWeek,
      },
    });

    if (!availability) {
      throw new BadRequestException(`Doctor is not available on ${dayOfWeek}`);
    }

    const [startHour, startMinute] = dto.startTime.split('T')[1].slice(0, 5).split(':').map(Number);
    const [endHour, endMinute] = dto.endTime.split('T')[1].slice(0, 5).split(':').map(Number);

    const appointmentStartMinutes = startHour * 60 + startMinute;
    const appointmentEndMinutes = endHour * 60 + endMinute;

    const [availStartHour, availStartMinute] = availability.startTime.split(':').map(Number);
    const [availEndHour, availEndMinute] = availability.endTime.split(':').map(Number);

    const availabilityStartMinutes = availStartHour * 60 + availStartMinute;
    const availabilityEndMinutes = availEndHour * 60 + availEndMinute;

    if (
      appointmentStartMinutes < availabilityStartMinutes ||
      appointmentEndMinutes > availabilityEndMinutes
    ) {
      throw new BadRequestException(
        `Doctor is only available from ${availability.startTime} to ${availability.endTime} on ${dayOfWeek}`,
      );
    }

    // 🚫 Verificar solapamiento con otros turnos
    const overlapping = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.doctor_id = :doctorId', { doctorId: dto.doctorId })
      .andWhere('(appointment.start_time, appointment.end_time) OVERLAPS (:start, :end)', {
        start,
        end,
      })
      .getOne();

    if (overlapping)
      throw new BadRequestException('Doctor is already booked for that time');

    // ✅ Crear la cita
    const appointment = this.appointmentRepo.create({
      ...dto,
      startTime: start,
      endTime: end,
      patient,
      doctor,
    });

    return this.appointmentRepo.save(appointment);
  }

  // 🔍 Obtener todos los turnos con filtros opcionales
  async findAll(filterDto: FilterAppointmentsDto): Promise<Appointment[]> {
    const { doctorId, patientId, status, startDate, endDate } = filterDto;

    const where: FindOptionsWhere<Appointment> = {};

    if (doctorId) where.doctor = { id: doctorId };
    if (patientId) where.patient = { id: patientId };
    if (status) where.status = status;

    if (startDate && endDate)
      where.startTime = Between(new Date(startDate), new Date(endDate));

    return this.appointmentRepo.find({
      where,
      relations: ['patient', 'doctor'],
      order: { startTime: 'ASC' },
    });
  }

  // 📄 Obtener un turno por ID
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment)
      throw new NotFoundException(`Appointment with ID ${id} not found`);

    return appointment;
  }

  // ✏️ Actualizar turno
  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    return this.appointmentRepo.save(appointment);
  }

  // ❌ Cancelar turno
  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  // 🗑️ Eliminar completamente
  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepo.remove(appointment);
  }
}
