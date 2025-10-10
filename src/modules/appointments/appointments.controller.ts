import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/appointments-filter.dto';
import { Appointment } from './appointment.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment successfully created',
    type: Appointment,
  })
  async create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all appointments (with optional filters)' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully',
    type: [Appointment],
  })
  async findAll(@Query() filters: FilterAppointmentsDto): Promise<Appointment[]> {
    return this.appointmentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment found',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment successfully updated',
    type: Appointment,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 204, description: 'Appointment successfully deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.appointmentsService.remove(id);
  }
}
