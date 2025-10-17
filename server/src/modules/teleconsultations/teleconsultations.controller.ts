import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { TeleconsultationsService } from './teleconsultations.service';
import { TeleconsultationStatus } from './teleconsultation.entity';

@Controller('teleconsultations')
export class TeleconsultationsController {
    constructor(private readonly teleService: TeleconsultationsService) {}

    @Post(':appointmentId')
    create(@Param('appointmentId') appointmentId: string) {
        return this.teleService.create(appointmentId);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.teleService.findById(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: TeleconsultationStatus,
    ) {
        return this.teleService.updateStatus(id, status);
    }
}

