import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { UpdateDoctorDto } from './dtos/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findAll() {
    return this.doctorRepository.find({
      relations: ['user', 'availabilities'],
    });
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'availabilities'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, dto);
    return this.doctorRepository.save(doctor);
  }
}
