import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Repository } from 'typeorm';
import { Teleconsultation, TeleconsultationStatus } from './teleconsultation.entity';

@Injectable()
export class TeleconsultationsService {
    constructor(
        @InjectRepository(Teleconsultation)
        private readonly teleRepo: Repository<Teleconsultation>,
    ) {}
    
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
