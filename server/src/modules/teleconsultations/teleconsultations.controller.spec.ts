import { Test, TestingModule } from '@nestjs/testing';
import { TeleconsultationsController } from './teleconsultations.controller';

describe('TeleconsultationsController', () => {
  let controller: TeleconsultationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeleconsultationsController],
    }).compile();

    controller = module.get<TeleconsultationsController>(
      TeleconsultationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
