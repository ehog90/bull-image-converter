import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CqrsModule } from '@nestjs/cqrs';

import { ImageEventGateway } from './gateways/image-event/image-event.gateway';
import { ImageProcessingService } from './services/image-processing/image-processing.service';
import { UploadController } from './controllers/upload/upload.controller';
import { ImageProcessorService } from './services/image-processor/image-processor.service';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export const staticDir = './static';

if (!existsSync(staticDir)) {
  mkdir(staticDir);
}

@Module({
  imports: [
    CqrsModule,
    ServeStaticModule.forRoot({
      rootPath: staticDir,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'images',
    }),
  ],
  controllers: [UploadController],
  providers: [ImageEventGateway, ImageProcessingService, ImageProcessorService],
})
export class AppModule {}
