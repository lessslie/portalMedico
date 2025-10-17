import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';

@Entity('doctor_availabilities')
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'day_of_week', type: 'varchar', length: 20 })
  dayOfWeek: string; // e.g. "monday", "tuesday"

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
