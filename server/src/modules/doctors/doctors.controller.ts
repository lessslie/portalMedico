import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dtos/update-doctor.dto';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all doctors (public or admin)' })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor profile by ID' })
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor personal or professional info' })
  update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(id, dto);
  }
}
