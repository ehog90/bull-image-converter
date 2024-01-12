import { Test, TestingModule } from '@nestjs/testing';
import { ImageEventGateway } from './image-event.gateway';

describe('ImageEventGateway', () => {
  let gateway: ImageEventGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageEventGateway],
    }).compile();

    gateway = module.get<ImageEventGateway>(ImageEventGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
