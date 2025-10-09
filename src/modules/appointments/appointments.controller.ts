import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {}
