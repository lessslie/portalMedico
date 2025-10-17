// src/modules/appointments/appointments-notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsNotificationService {
  private readonly logger = new Logger(AppointmentsNotificationService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Cron job que ejecuta cada 1 hora
   * Busca citas que empiezan en las próximas 24 horas
   * y envía recordatorios por email
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendAppointmentReminders(): Promise<void> {
    this.logger.log('🔔 Ejecutando cron job de recordatorios de citas...');

    try {
      // Calcular ventana de tiempo: entre ahora y 24 horas adelante
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Buscar citas que:
      // - Empiezan en las próximas 24 horas
      // - Están en estado SCHEDULED (no canceladas ni completadas)
      const upcomingAppointments = await this.appointmentRepository.find({
        where: {
          startTime: Between(now, in24Hours),
          status: AppointmentStatus.SCHEDULED,
        },
        relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
      });

      if (upcomingAppointments.length === 0) {
        this.logger.log('✅ No hay citas próximas para recordar');
        return;
      }

      this.logger.log(
        `📧 Encontradas ${upcomingAppointments.length} citas próximas. Enviando recordatorios...`,
      );

      let successCount = 0;
      let errorCount = 0;

      // Enviar recordatorio por cada cita
      for (const appointment of upcomingAppointments) {
        try {
          // Email al paciente
          await this.emailService.sendAppointmentReminderToPatient({
            patientEmail: appointment.patient.user.username,
            patientName: appointment.patient.firstName,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            doctorSpecialty: appointment.doctor.specialty,
            appointmentDate: appointment.startTime,
            appointmentType: appointment.type,
          });

          // Email al doctor
          await this.emailService.sendAppointmentReminderToDoctor({
            doctorEmail: appointment.doctor.user.username,
            doctorName: appointment.doctor.firstName,
            patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            appointmentDate: appointment.startTime,
            appointmentType: appointment.type,
          });

          successCount++;
          this.logger.log(
            `✅ Recordatorio enviado para cita ${appointment.id} (${appointment.patient.firstName} - Dr. ${appointment.doctor.lastName})`,
          );
        } catch (error) {
          errorCount++;
          this.logger.error(
            `❌ Error al enviar recordatorio para cita ${appointment.id}:`,
            error instanceof Error ? error.message : 'Error desconocido',
          );
        }
      }

      this.logger.log(
        `📊 Resumen: ${successCount} recordatorios enviados, ${errorCount} errores`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Error en el cron job de recordatorios:',
        error instanceof Error ? error.message : 'Error desconocido',
      );
    }
  }

  /**
   * Método para testing manual (opcional)
   * Envía recordatorios sin esperar al cron
   */
  async sendRemindersNow(): Promise<void> {
    this.logger.log('🔧 Ejecutando recordatorios manualmente...');
    await this.sendAppointmentReminders();
  }
}