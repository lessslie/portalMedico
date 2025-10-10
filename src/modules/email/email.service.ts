// src/modules/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  userName?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface NodemailerResponse {
  messageId: string;
  envelope: {
    from: string;
    to: string[];
  };
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: string;
}
interface SendDoctorActivationEmailParams {
  to: string;
  token: string;
  doctorName: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      this.logger.warn(
        '⚠️ Configuración SMTP incompleta. Los emails se mostrarán en consola solamente.',
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // true para puerto 465, false para otros puertos
        requireTLS: true, // Forzar STARTTLS para Gmail
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false, // Solo para desarrollo
        },
      });

      this.logger.log('✅ Nodemailer configurado correctamente con Gmail');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error('❌ Error al configurar Nodemailer:', errorMessage);
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<EmailResponse> {
    const { to, token, userName } = params;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const emailFrom =
      this.configService.get<string>('SMTP_USER') || 'noreply@healthtech.com';
    const emailFromName =
      this.configService.get<string>('EMAIL_FROM_NAME') ||
      'Portal HealthTech';

    const mailOptions = {
      from: `"${emailFromName}" <${emailFrom}>`,
      to,
      subject: '🔐 Recuperación de Contraseña - Portal HealthTech',
      text: this.getPasswordResetTextTemplate(resetUrl, userName),
      html: this.getPasswordResetHtmlTemplate(resetUrl, userName),
    };

    // Si no hay transporter configurado, solo mostrar en consola
    if (!this.transporter) {
      this.logger.warn('📧 EMAIL NO ENVIADO (SMTP no configurado)');
      this.logger.log('═══════════════════════════════════════');
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Asunto: ${mailOptions.subject}`);
      this.logger.log(`Link de reset: ${resetUrl}`);
      this.logger.log('═══════════════════════════════════════');

      return {
        success: false,
        error: 'SMTP no configurado',
      };
    }

    try {
      const info = (await this.transporter.sendMail(mailOptions)) as NodemailerResponse;

      this.logger.log(`✅ Email enviado exitosamente a ${to}`);
      this.logger.log(`📬 Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(`❌ Error al enviar email a ${to}:`, errorMessage);

      // Fallback: mostrar en consola
      this.logger.log('═══════════════════════════════════════');
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Link de reset: ${resetUrl}`);
      this.logger.log('═══════════════════════════════════════');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Enviar email de activación de cuenta a doctor
   */
  async sendDoctorActivationEmail(
    params: SendDoctorActivationEmailParams,
  ): Promise<EmailResponse> {
    const { to, token, doctorName } = params;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:4200';
    const activationUrl = `${frontendUrl}/activate-account?token=${token}`;

    const emailFrom =
      this.configService.get<string>('SMTP_USER') || 'noreply@healthtech.com';
    const emailFromName =
      this.configService.get<string>('EMAIL_FROM_NAME') ||
      'Portal HealthTech';

    const mailOptions = {
      from: `"${emailFromName}" <${emailFrom}>`,
      to,
      subject: '🎉 Bienvenido a Portal HealthTech - Activa tu cuenta',
      text: this.getDoctorActivationTextTemplate(activationUrl, doctorName),
      html: this.getDoctorActivationHtmlTemplate(activationUrl, doctorName),
    };

    if (!this.transporter) {
      this.logger.warn('📧 EMAIL NO ENVIADO (SMTP no configurado)');
      this.logger.log('═══════════════════════════════════════');
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Asunto: ${mailOptions.subject}`);
      this.logger.log(`Link de activación: ${activationUrl}`);
      this.logger.log('═══════════════════════════════════════');

      return {
        success: false,
        error: 'SMTP no configurado',
      };
    }

    try {
      const info = (await this.transporter.sendMail(
        mailOptions,
      )) as NodemailerResponse;

      this.logger.log(`✅ Email de activación enviado a ${to}`);
      this.logger.log(`📬 Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(`❌ Error al enviar email a ${to}:`, errorMessage);

      this.logger.log('═══════════════════════════════════════');
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Link de activación: ${activationUrl}`);
      this.logger.log('═══════════════════════════════════════');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private getPasswordResetTextTemplate(
    resetUrl: string,
    userName?: string,
  ): string {
    const greeting = userName ? `Hola ${userName},` : 'Hola,';

    return `
${greeting}

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Portal HealthTech.

Para crear una nueva contraseña, haz clic en el siguiente enlace:
${resetUrl}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida y tu cuenta permanecerá segura.

Por seguridad:
- Nunca compartas este enlace con nadie
- Nosotros nunca te pediremos tu contraseña por email
- Si tienes dudas, contacta a nuestro soporte

Saludos,
Equipo de Portal HealthTech

---
Este es un email automático, por favor no respondas a este mensaje.
    `.trim();
  }

  private getPasswordResetHtmlTemplate(
    resetUrl: string,
    userName?: string,
  ): string {
    const greeting = userName ? `Hola ${userName},` : 'Hola,';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔐 Portal HealthTech
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #666666; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Portal HealthTech.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666; line-height: 1.6;">
                Para crear una nueva contraseña, haz clic en el siguiente botón:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alert Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  ⏱️ <strong>Este enlace expirará en 1 hora</strong> por seguridad.
                </p>
              </div>
              
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 0 0 20px; border-radius: 4px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #721c24;">
                  ⚠️ <strong>Si no solicitaste esto, ignora este email.</strong>
                </p>
                <p style="margin: 0; font-size: 14px; color: #721c24;">
                  Tu contraseña actual seguirá siendo válida y tu cuenta permanecerá segura.
                </p>
              </div>
              
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                <strong>Por seguridad:</strong>
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 14px; color: #666666;">
                <li style="margin-bottom: 8px;">Nunca compartas este enlace con nadie</li>
                <li style="margin-bottom: 8px;">Nosotros nunca te pediremos tu contraseña por email</li>
                <li>Si tienes dudas, contacta a nuestro soporte</li>
              </ul>
              
              <p style="margin: 20px 0 0; font-size: 14px; color: #999999;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #0066cc; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #333333;">
                Saludos,<br>
                <strong>Equipo de Portal HealthTech</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Este es un email automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
  /**
   * NUEVO: Template de texto para activación de doctor
   */
  private getDoctorActivationTextTemplate(
    activationUrl: string,
    doctorName: string,
  ): string {
    return `
¡Bienvenido Dr./Dra. ${doctorName}!

El administrador del sistema ha creado tu cuenta en Portal HealthTech.

Para comenzar a usar la plataforma, necesitas activar tu cuenta y establecer tu contraseña.

Haz clic en el siguiente enlace para activar tu cuenta:
${activationUrl}

Este enlace es válido por 7 días.

Una vez que actives tu cuenta, podrás:
- Gestionar tu agenda de citas
- Consultar historiales médicos de tus pacientes
- Realizar teleconsultas
- Y mucho más

Si tienes alguna duda, contacta al administrador del sistema.

Saludos,
Equipo de Portal HealthTech

---
Este es un email automático, por favor no respondas a este mensaje.
    `.trim();
  }

  /**
   *  Template HTML para activación de doctor
   */
  private getDoctorActivationHtmlTemplate(
    activationUrl: string,
    doctorName: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activa tu cuenta - Portal HealthTech</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🎉 Bienvenido a Portal HealthTech
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #333333; font-weight: bold;">
                ¡Hola Dr./Dra. ${doctorName}!
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #666666; line-height: 1.6;">
                El administrador del sistema ha creado tu cuenta en Portal HealthTech.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666; line-height: 1.6;">
                Para comenzar a usar la plataforma, necesitas <strong>activar tu cuenta</strong> y establecer tu contraseña.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${activationUrl}" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.4);">
                      Activar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 0 0 20px; border-radius: 4px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #1e40af;">
                  ⏱️ <strong>Este enlace es válido por 7 días.</strong>
                </p>
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  Si no activas tu cuenta antes de esa fecha, contacta al administrador.
                </p>
              </div>
              
              <p style="margin: 0 0 10px; font-size: 16px; color: #333333; font-weight: bold;">
                Una vez que actives tu cuenta, podrás:
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 14px; color: #666666;">
                <li style="margin-bottom: 8px;">✅ Gestionar tu agenda de citas</li>
                <li style="margin-bottom: 8px;">✅ Consultar historiales médicos de tus pacientes</li>
                <li style="margin-bottom: 8px;">✅ Realizar teleconsultas</li>
                <li>✅ Y mucho más</li>
              </ul>
              
              <p style="margin: 20px 0 0; font-size: 14px; color: #999999;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #0066cc; word-break: break-all;">
                ${activationUrl}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #333333;">
                Saludos,<br>
                <strong>Equipo de Portal HealthTech</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Este es un email automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}