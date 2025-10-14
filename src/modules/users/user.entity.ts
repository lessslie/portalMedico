import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Notification } from '../notifications/notification.entity';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true }) // ← NUEVO: nullable para doctors sin activar
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: false }) // ← NUEVO: para activación de cuenta
  isActive: boolean;

  //  CORREGIDO: 1:N para patients (un user puede tener varios patients)
  @OneToMany(() => Patient, (patient) => patient.user)
  patients: Patient[];

  // CORREGIDO: 1:1 para doctor (un user = un doctor)
  @OneToOne(() => Doctor, (doctor) => doctor.user, { nullable: true })
  doctor?: Doctor;

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}