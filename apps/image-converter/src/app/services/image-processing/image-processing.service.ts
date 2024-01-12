import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { ImageJob } from '../../types';

@Injectable()
export class ImageProcessingService {
  private logger = new Logger(ImageProcessingService.name);

  constructor(@InjectQueue('images') private imagesQueue: Queue<ImageJob>) {}

  public async addImageToQueue(files: Express.Multer.File[]) {
    for (const file of files) {
      this.logger.log(`Adding images to queue: ${file.originalname}`);
      this.imagesQueue.add({
        name: file.originalname,
        content: file.buffer.toString('base64'),
      });
    }
  }
}
