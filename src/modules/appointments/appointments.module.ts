import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.entity';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { EmailModule } from '../email/email.module';
import { AppointmentsNotificationService } from './appointments-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Patient, Doctor]),
    EmailModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService,AppointmentsNotificationService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
