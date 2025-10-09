import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Appointment } from '../appointments/appointment.entity';
import { MedicalRecord } from '../medical-records/medical-record.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.patients, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Index({ unique: true, where: 'email IS NOT NULL' })
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ nullable: true })
  insurance?: string;

  @Column({ default: true })
  isPrimary: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => MedicalRecord, (record) => record.patient)
  records: MedicalRecord[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}