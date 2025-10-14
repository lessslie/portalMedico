import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Teleconsultation } from './teleconsultation.entity';
import { User } from '../users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => Teleconsultation, tele => tele.messages, { onDelete: 'CASCADE' })
  teleconsultation: Teleconsultation;

  @CreateDateColumn()
  createdAt: Date;
}
