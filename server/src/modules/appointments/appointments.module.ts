import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.entity';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { EmailModule } from '../email/email.module';
import { AppointmentsNotificationService } from './appointments-notification.service';
import { DoctorAvailability } from '../doctor-availability/doctor-availability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Patient, Doctor,DoctorAvailability]),
    EmailModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService,AppointmentsNotificationService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
