import { Module } from '@nestjs/common';
import { TeleconsultationsController } from './teleconsultations.controller';
import { TeleconsultationsService } from './teleconsultations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teleconsultation } from './teleconsultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teleconsultation])],
  controllers: [TeleconsultationsController],
  providers: [TeleconsultationsService],
  exports: [TeleconsultationsService],
})
export class TeleconsultationsModule {}
