import { Test, TestingModule } from '@nestjs/testing';
import { TeleconsultationsService } from './teleconsultations.service';

describe('TeleconsultationsService', () => {
  let service: TeleconsultationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeleconsultationsService],
    }).compile();

    service = module.get<TeleconsultationsService>(TeleconsultationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});