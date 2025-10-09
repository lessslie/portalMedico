import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Teleconsultation } from '../teleconsultations/teleconsultation.entity';
import { MedicalRecord } from '../medical-records/medical-record.entity';
import { ApiProperty } from '@nestjs/swagger';


export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('files')
export class File {
  @ApiProperty({ description: 'ID único del archivo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Teleconsulta asociada al archivo',
    type: () => Teleconsultation,
    required: false,
  })
  @ManyToOne(() => Teleconsultation, (tele) => tele.files, { nullable: true })
  @JoinColumn({ name: 'teleconsultation_id' })
  teleconsultation?: Teleconsultation;


  @ApiProperty({
    description: 'Historial médico asociado al archivo',
    type: () => MedicalRecord,
    required: false,
  })
  @ManyToOne(() => MedicalRecord, (record) => record.files, { nullable: true })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord;


  @ApiProperty({
    description: 'Nombre del archivo',
    example: 'radiografia_pecho.jpg',
  })
  @Column({ name: 'file_name' })
  fileName: string;

   @ApiProperty({
    description: 'Tipo de archivo',
    example: 'image/jpeg',
  })
  @Column({ name: 'file_type' })
  fileType: string;

    @ApiProperty({
    description: 'Ruta donde se almacena el archivo',
    example: '/uploads/files/2024/radiografia_pecho.jpg',
  })
  @Column()
  path: string;

    @ApiProperty({
    description: 'Descripción opcional del archivo',
    example: 'Radiografía de tórax para diagnóstico',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;


    @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

    @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
