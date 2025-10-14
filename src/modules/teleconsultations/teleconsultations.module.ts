import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeleconsultationsController } from './teleconsultations.controller';
import { TeleconsultationsService } from './teleconsultations.service';
import { Teleconsultation } from './teleconsultation.entity';
import { Message } from './message.entity';
import { TeleconsultationsGateway } from './teleconsultations.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Teleconsultation, Message])],
  controllers: [TeleconsultationsController],
  providers: [TeleconsultationsService, TeleconsultationsGateway],
  exports: [TeleconsultationsService],
})
export class TeleconsultationsModule {}

