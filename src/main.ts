import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
     //Configuración Swagger con TODOS los módulos
    const config = new DocumentBuilder()
      .setTitle('HealthTech Portal API')
      .setDescription('API para gestión de citas médicas y teleasistencia')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      // Tags para todos los modulos
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios del sistema')
      .addTag('patients', 'Gestión de pacientes')
      .addTag('doctors', 'Gestión de médicos')
      .addTag('appointments', 'Gestión de citas médicas')
      .addTag('medical-records', 'Historiales médicos')
      .addTag('teleconsultations', 'Teleconsultas y videollamadas')
      .addTag('notifications', 'Sistema de notificaciones')
      .addTag('files', 'Gestión de archivos y documentos')
      .addServer(`http://localhost:${process.env.PORT || 3000}/api/v1`, 'Development')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    SwaggerModule.setup('api/v1/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none', // Colapsa todo por defecto
        filter: true, // Permite buscar endpoints
      },
      customSiteTitle: 'HealthTech API Docs',
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Server running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/v1/docs`);
 
  } catch (error) {
    logger.error('❌ Error starting server', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
