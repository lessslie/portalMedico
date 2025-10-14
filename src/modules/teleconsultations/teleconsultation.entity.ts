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
import { Appointment } from '../appointments/appointment.entity';
import { File } from '../files/file.entity';
import { Message } from './message.entity'; // 👈 Importamos Message

export enum TeleconsultationStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('teleconsultations')
export class Teleconsultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appt) => appt.teleconsultations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ length: 500 })
  url: string;

  @Column({
    type: 'enum',
    enum: TeleconsultationStatus,
    default: TeleconsultationStatus.SCHEDULED,
  })
  status: TeleconsultationStatus;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime?: Date;

  @OneToMany(() => File, (file) => file.teleconsultation, { cascade: true })
  files: File[];

  // 👇 Nueva relación con los mensajes del chat
  @OneToMany(() => Message, (message) => message.teleconsultation, {
    cascade: true,
  })
  messages: Message[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
