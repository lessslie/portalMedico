import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Teleconsultation } from '../teleconsultations/teleconsultation.entity';
import { MedicalRecord } from '../medical-records/medical-record.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.IN_PERSON,
  })
  type: AppointmentType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => Teleconsultation, (tele) => tele.appointment, {
    cascade: true,
  })
  teleconsultations: Teleconsultation[];

  @OneToMany(() => MedicalRecord, (record) => record.appointment, {
    cascade: true,
  })
  records: MedicalRecord[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
