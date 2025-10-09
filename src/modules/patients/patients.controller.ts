import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('patients')
@Controller('patients')
export class PatientsController {}
