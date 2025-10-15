import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TeleconsultationsModule } from './modules/teleconsultations/teleconsultations.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AdminModule } from './modules/admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentsModule } from './modules/appointments/appointments.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(),
    TeleconsultationsModule,
    AuthModule,
    UsersModule,
    EmailModule,
    PatientsModule,
    UsersModule,
    AdminModule,
    AppointmentsModule
  ],
})
export class AppModule {}
