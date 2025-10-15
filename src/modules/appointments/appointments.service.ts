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

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // 🧩 Crear un nuevo turno
 async create(dto: CreateAppointmentDto): Promise<Appointment> {
  const patient = await this.patientRepo.findOne({
    where: { id: dto.patientId },
    relations: ['user'],
  });
  const doctor = await this.doctorRepo.findOne({
    where: { id: dto.doctorId },
    relations: ['user'],
  });

  if (!patient) throw new NotFoundException('Patient not found');
  if (!doctor) throw new NotFoundException('Doctor not found');

  const start = new Date(dto.startTime);
  const end = new Date(dto.endTime);

  const overlapping = await this.appointmentRepo
    .createQueryBuilder('appointment')
    .where('appointment.doctor_id = :doctorId', { doctorId: dto.doctorId })
    .andWhere('(appointment.start_time, appointment.end_time) OVERLAPS (:start, :end)', { start, end })
    .getOne();

  if (overlapping)
    throw new BadRequestException('Doctor is already booked for that time');

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
      relations: ['patient', 'doctor', 'teleconsultations', 'records'],
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

  // ❌ Cancelar turno (soft delete lógico)
  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  // 🗑️ Eliminar completamente (si querés hacerlo físico)
  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepo.remove(appointment);
  }
}
