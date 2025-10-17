import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { CreateDoctorAvailabilityDto } from './dtos/create-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dtos/update-availability.dto';

@ApiTags('doctor-availability')
@Controller('doctor-availability')
export class DoctorAvailabilityController {
  constructor(
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  // 🧩 Crear una disponibilidad puntual
  @Post(':doctorId')
  @ApiOperation({ summary: 'Create availability for a specific day' })
  @ApiParam({ name: 'doctorId', description: 'UUID of the doctor' })
  create(
    @Param('doctorId') doctorId: string,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.create(doctorId, dto);
  }

  // 📦 Crear múltiples disponibilidades en bloque (ej: lunes a viernes)
  @Post(':doctorId/bulk')
  @ApiOperation({ summary: 'Create multiple availabilities for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'UUID of the doctor' })
  @ApiBody({
    type: [CreateDoctorAvailabilityDto],
    description: 'Array of availability objects',
    examples: {
      example: {
        summary: 'Weekdays 9-17',
        value: [
          { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'thursday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'friday', startTime: '09:00', endTime: '17:00' },
        ],
      },
    },
  })
  createBulk(
    @Param('doctorId') doctorId: string,
    @Body() dtos: CreateDoctorAvailabilityDto[],
  ) {
    return this.availabilityService.createBulk(doctorId, dtos);
  }

  // 📄 Obtener todas las disponibilidades del doctor
  @Get(':doctorId')
  @ApiOperation({ summary: 'Get all availabilities for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'UUID of the doctor' })
  findAllByDoctor(@Param('doctorId') doctorId: string) {
    return this.availabilityService.findAllByDoctor(doctorId);
  }

  // ✏️ Actualizar una disponibilidad puntual
  @Patch(':id')
  @ApiOperation({ summary: 'Update a doctor availability' })
  update(@Param('id') id: string, @Body() dto: UpdateDoctorAvailabilityDto) {
    return this.availabilityService.update(id, dto);
  }

  // ❌ Eliminar una disponibilidad
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor availability' })
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
}
