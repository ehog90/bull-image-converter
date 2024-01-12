import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ImageJob } from '../../types';
import sharp from 'sharp';
import { EventBus } from '@nestjs/cqrs';
import { ImageConvertedEvent } from '../../events/image-converted.event';
import { join } from 'path';
@Processor('images', { concurrency: 1 })
export class ImageProcessorService extends WorkerHost {
  constructor(private readonly eventBus: EventBus) {
    super();
  }

  async process(job: Job<ImageJob, unknown, string>): Promise<unknown> {
    this.logger.log('Converting job is running: ' + job.data.name);
    const buffer = Buffer.from(job.data.content, 'base64');
    const fileName = `${job.data.name}.avif`;

    await sharp(buffer).toFile(join('./static', fileName));
    this.logger.log('Converting job is finished: ' + job.data.name);
    this.eventBus.publish(new ImageConvertedEvent(fileName));
    return true;
  }
  private logger = new Logger(ImageProcessorService.name);
}
