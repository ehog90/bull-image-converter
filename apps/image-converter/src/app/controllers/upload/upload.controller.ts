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
  // #region Constructors (1)

  constructor(
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  // #endregion Constructors (1)

  // #region Public Methods (1)

  @Post('')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  public uploadPictures(
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    this.imageProcessingService.addImagesToQueue(files.images ?? []);
  }

  // #endregion Public Methods (1)
}
