import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Subject, takeUntil } from 'rxjs';

import { Server, Socket } from 'socket.io';
import { ImageConvertedEvent } from '../../events/image-converted.event';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ImageEnqueuedEvent } from '../../events/image-enqueued.event';

@WebSocketGateway({ cors: true })
export class ImageEventGateway implements OnModuleDestroy, OnModuleInit {
  // #region Properties (3)

  private logger = new Logger(ImageEventGateway.name);
  private until = new Subject<void>();

  @WebSocketServer()
  public server: Server;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor(
    private readonly eventBus: EventBus,
    @InjectQueue('images') private imagesQueue: Queue,
  ) {}

  // #endregion Constructors (1)

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleConnection(_: Socket) {
    this.logger.log('A client is connected!');
    const jobData = await this.imagesQueue.getJobCounts();
    this.server.emit('stats', {
      remaining: jobData.active + jobData.waiting,
      completed: jobData.completed,
    });
  }

  public onModuleDestroy() {
    this.until.next();
    this.until.complete();
  }

  public onModuleInit() {
    this.eventBus
      .pipe(ofType(ImageConvertedEvent), takeUntil(this.until))
      .subscribe(async (event) => {
        const jobData = await this.imagesQueue.getJobCounts();
        this.server.emit('newImage', {
          imageUrl: event.imageUrl,
          remaining: jobData.active + jobData.waiting,
          completed: jobData.completed,
        });
      })
      this.eventBus
      .pipe(ofType(ImageEnqueuedEvent), takeUntil(this.until))
      .subscribe(async () => {
        const jobData = await this.imagesQueue.getJobCounts();
        this.server.emit('stats', {
          remaining: jobData.active + jobData.waiting,
          completed: jobData.completed,
        });
      });
  }

  // #endregion Public Methods (3)
}
