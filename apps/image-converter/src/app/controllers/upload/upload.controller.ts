import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImageProcessingService } from '../../services/image-processing/image-processing.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly imageProcessingService: ImageProcessingService
  ) {}

  @Post('')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  uploadPictures(
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    }
  ) {
    this.imageProcessingService.addImageToQueue(files.images ?? []);
  }
}
