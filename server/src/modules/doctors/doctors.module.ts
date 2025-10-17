import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';
import { User } from '../users/user.entity';
import { DoctorAvailability } from '../doctor-availability/doctor-availability.entity';
import { DoctorAvailabilityModule } from '../doctor-availability/doctor-availability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, User, DoctorAvailability]),
    DoctorAvailabilityModule, 
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
