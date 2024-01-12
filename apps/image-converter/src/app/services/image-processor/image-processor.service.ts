import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ImageJob } from '../../types';
import sharp from 'sharp';
import { EventBus } from '@nestjs/cqrs';
import { ImageConvertedEvent } from '../../events/image-converted.event';
import { join } from 'path';
@Processor('images')
export class ImageProcessorService {
  private logger = new Logger(ImageProcessorService.name);

  constructor(private readonly eventBus: EventBus) {}

  @Process()
  async transcode(job: Job<ImageJob>) {
    this.logger.log('Converting job is running: ' + job.data.name);
    const buffer = Buffer.from(job.data.content, 'base64');
    const fileName = `${job.data.name}.avif`;

    await sharp(buffer).toFile(join('./static', fileName));
    this.logger.log('Converting job is finished: ' + job.data.name);
    this.eventBus.publish(new ImageConvertedEvent(fileName));
    return true;
  }
}
