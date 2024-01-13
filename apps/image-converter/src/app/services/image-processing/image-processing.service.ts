import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, UploadedFiles } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { file } from 'tmp-promise';
import { writeFile } from 'fs/promises';
import { ImageJob } from '../../types';
import { EventBus } from '@nestjs/cqrs';
import { ImageEnqueuedEvent } from '../../events/image-enqueued.event';
import { from, mergeMap } from 'rxjs';

@Injectable()
export class ImageProcessingService {
  // #region Properties (1)

  private logger = new Logger(ImageProcessingService.name);

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(@InjectQueue('images') private readonly imagesQueue: Queue<ImageJob>, private readonly eventBus: EventBus) {}

  // #endregion Constructors (1)

  // #region Public Methods (1)

  public async addImagesToQueue(files: Express.Multer.File[]) {
    for (const uploadedFile of files) {
      const { path } = await file();
      await writeFile(path, uploadedFile.buffer);
      this.logger.log(
        `Adding image to queue: ${uploadedFile.originalname}, temp location: ${path}`,
      );
      this.imagesQueue.add(uploadedFile.originalname, {
        name: uploadedFile.originalname,
        content: uploadedFile.buffer,
        tempLocation: path,
        newFileName: `${uploadedFile.originalname}.avif`,
      });
      this.eventBus.publish(new ImageEnqueuedEvent())
    }
  }

  // #endregion Public Methods (1)
}
