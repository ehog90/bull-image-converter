import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { ImageJob } from '../../types';
import { file } from 'tmp-promise';
import { writeFile } from 'fs/promises';

@Injectable()
export class ImageProcessingService {
  private logger = new Logger(ImageProcessingService.name);

  constructor(@InjectQueue('images') private imagesQueue: Queue<ImageJob>) {}

  public async addImageToQueue(files: Express.Multer.File[]) {
    for (const uploadedFile of files) {
      const { path } = await file();
      await writeFile(path, uploadedFile.buffer);
      this.logger.log(
        `Adding image to queue: ${uploadedFile.originalname}, temp location: ${path}`
      );
      this.imagesQueue.add(uploadedFile.originalname, {
        name: uploadedFile.originalname,
        content: uploadedFile.buffer,
        tempLocation: path,
        newFileName: `${uploadedFile.originalname}.avif`,
      });
    }
  }
}
