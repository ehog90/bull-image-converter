import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ImageJob } from '../../types';
import sharp from 'sharp';
import { EventBus } from '@nestjs/cqrs';
import { ImageConvertedEvent } from '../../events/image-converted.event';
import { join } from 'path';
import { rm } from 'fs/promises';
@Processor('images', { concurrency: 1 })
export class ImageProcessorService extends WorkerHost {
  private logger = new Logger(ImageProcessorService.name);
  constructor(private readonly eventBus: EventBus) {
    super();
  }

  async process(job: Job<ImageJob>) {
    const fileName = `${job.data.name}.avif`;
    await sharp(job.data.tempLocation).toFile(join('./static', fileName));
  }

  @OnWorkerEvent('active')
  onActive(job: Job<ImageJob>) {
    this.logger.log(`Converting job is active: ${job.data.newFileName}`);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<ImageJob>) {
    this.logger.log(`Converting job is done: ${job.data.newFileName}`);
    this.eventBus.publish(new ImageConvertedEvent(job.data.newFileName));
    await rm(job.data.tempLocation);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ImageJob>) {
    this.logger.log(`Converting job is failed: ${job.data.newFileName}`);
    await rm(job.data.tempLocation);
  }
}
