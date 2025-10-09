import { Test, TestingModule } from '@nestjs/testing';
import { TeleconsultationsService } from './teleconsultations.service';
import { Teleconsultation, TeleconsultationStatus } from './teleconsultation.entity';
import { Repository } from 'typeorm';
import { ObjectLiteral } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from '../appointments/appointment.entity';

// Definimos un tipo de mock de repositorio
type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Helper para crear repositorios mockeados
const createMockRepository = <T extends ObjectLiteral = ObjectLiteral>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

// Helper para crear un appointment mockeado
const createMockAppointment = (id: string): Partial<Appointment> & { id: string } => ({
  id,
  teleconsultations: [],
});

describe('TeleconsultationsService', () => {
  let service: TeleconsultationsService;
  let teleRepo: MockRepository<Teleconsultation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeleconsultationsService,
        {
          provide: getRepositoryToken(Teleconsultation),
          useValue: createMockRepository<Teleconsultation>(),
        },
      ],
    }).compile();

    service = module.get<TeleconsultationsService>(TeleconsultationsService);
    teleRepo = module.get<MockRepository<Teleconsultation>>(getRepositoryToken(Teleconsultation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a teleconsultation', async () => {
      const fakeTele: Teleconsultation = {
        id: 'uuid-123', 
        appointment: createMockAppointment('appt-1') as Appointment,
        url: 'https://app.telemed.com/session/uuid-123',
        status: TeleconsultationStatus.SCHEDULED,
        startTime: new Date(),
        endTime: undefined,
        files: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (teleRepo.create as jest.Mock).mockReturnValue(fakeTele);
      (teleRepo.save as jest.Mock).mockResolvedValue(fakeTele);

      const result = await service.create('appt-1');
      
      expect(teleRepo.create).toHaveBeenCalled();
      expect(teleRepo.save).toHaveBeenCalledWith(fakeTele);
      expect(result).toEqual(fakeTele);
    });
  });

  describe('findById', () => {
    it('should return a teleconsultation if found', async () => {
      const fakeTele: Teleconsultation = {
        id: 'uuid-123',
        appointment: createMockAppointment('appt-1') as Appointment,
        url: 'https://app.telemed.com/session/uuid-123',
        status: TeleconsultationStatus.SCHEDULED,
        startTime: new Date(),
        endTime: undefined,
        files: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (teleRepo.findOne as jest.Mock).mockResolvedValue(fakeTele);

      const result = await service.findById('uuid-123');
      
      expect(teleRepo.findOne).toHaveBeenCalledWith({ 
        where: { id: 'uuid-123' }, 
        relations: ['appointment'] 
      });
      expect(result).toEqual(fakeTele);
    });

    it('should throw if teleconsultation not found', async () => {
      (teleRepo.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(service.findById('not-exist')).rejects.toThrow(
        'Teleconsultation with id not-exist not found'
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the status and return the updated teleconsultation', async () => {
      const fakeTele: Teleconsultation = {
        id: 'uuid-123',
        appointment: createMockAppointment('appt-1') as Appointment,
        url: 'https://app.telemed.com/session/uuid-123',
        status: TeleconsultationStatus.SCHEDULED,
        startTime: new Date(),
        endTime: undefined,
        files: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTele: Teleconsultation = { 
        ...fakeTele, 
        status: TeleconsultationStatus.COMPLETED 
      };

      (teleRepo.update as jest.Mock).mockResolvedValue(undefined);
      (teleRepo.findOne as jest.Mock).mockResolvedValue(updatedTele);

      const result = await service.updateStatus('uuid-123', TeleconsultationStatus.COMPLETED);
      
      expect(teleRepo.update).toHaveBeenCalledWith('uuid-123', { 
        status: TeleconsultationStatus.COMPLETED 
      });
      expect(result.status).toEqual(TeleconsultationStatus.COMPLETED);
    });
  });
});