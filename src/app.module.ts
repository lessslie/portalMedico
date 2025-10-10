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


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    TeleconsultationsModule,
    AuthModule,
    UsersModule,
    EmailModule,
    PatientsModule,
    UsersModule,
    AdminModule,
  ],
})
export class AppModule {}
