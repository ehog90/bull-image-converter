import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import sharp from 'sharp';
import { EventBus } from '@nestjs/cqrs';
import { ImageConvertedEvent } from '../../events/image-converted.event';
import { join } from 'path';
import { rm } from 'fs/promises';
import { ImageJob } from '../../types';
@Processor('images', { concurrency: 1 })
export class ImageProcessorService extends WorkerHost {
  // #region Properties (1)

  private logger = new Logger(ImageProcessorService.name);

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(private readonly eventBus: EventBus) {
    super();
  }

  // #endregion Constructors (1)

  // #region Public Methods (4)

  @OnWorkerEvent('active')
  public onActive(job: Job<ImageJob>) {
    this.logger.debug(`Conversion job is active: ${job.data.newFileName}`);
  }

  @OnWorkerEvent('completed')
  public async onCompleted(job: Job<ImageJob>) {
    this.logger.log(`Conversion job is done: ${job.data.newFileName}`);
    this.eventBus.publish(new ImageConvertedEvent(job.data.newFileName));
    await rm(job.data.tempLocation);
  }

  @OnWorkerEvent('failed')
  public async onFailed(job: Job<ImageJob>) {
    this.logger.error(`Conversion job is failed: ${job.data.newFileName}`);
    await rm(job.data.tempLocation);
  }

  public async process(job: Job<ImageJob>) {
    const fileName = `${job.data.name}.avif`;
    await sharp(job.data.tempLocation).toFile(join('./static', fileName));
  }

  // #endregion Public Methods (4)
}
