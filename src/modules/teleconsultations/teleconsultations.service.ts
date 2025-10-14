import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Message } from './message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Teleconsultation, TeleconsultationStatus } from './teleconsultation.entity';

@Injectable()
export class TeleconsultationsService {
    constructor(
        @InjectRepository(Teleconsultation)
        private readonly teleRepo: Repository<Teleconsultation>,
        @InjectRepository(Message)
        private readonly msgRepo: Repository<Message>,
    ) {}
    
    async saveMessage(dto: CreateMessageDto): Promise<Message> {
            const tele = await this.teleRepo.findOne({
            where: { id: dto.teleconsultationId },
            relations: ['appointment'],
        });
        if (!tele) throw new Error('Teleconsultation not found');

        const message = this.msgRepo.create({
            content: dto.content,
            teleconsultation: tele,
            sender: { id: dto.senderId } as User,
        });
        return this.msgRepo.save(message);
    }

    async create(appointmentId: string): Promise<Teleconsultation> {
        const tele = this.teleRepo.create({
            appointment: { id: appointmentId } as Appointment,
            url: this.generateRoomUrl(),
            status: TeleconsultationStatus.SCHEDULED,
            startTime: new Date(),
        });
        return this.teleRepo.save(tele);
    }

    async findById(id: string): Promise<Teleconsultation> {
        const tele = await this.teleRepo.findOne({ where: { id }, relations: ['appointment'] });
        if (!tele) throw new Error(`Teleconsultation with id ${id} not found`);
        return tele;
    }

    async updateStatus(id: string, status: TeleconsultationStatus) {
        await this.teleRepo.update(id, { status });
        return this.findById(id);
    }

    private generateRoomUrl(): string {
        return `https://app.telemed.com/session/${crypto.randomUUID()}`;
    }
}
