import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Subject, takeUntil } from 'rxjs';

import { Server } from 'socket.io';
import { ImageConvertedEvent } from '../../events/image-converted.event';

@WebSocketGateway({ cors: true })
export class ImageEventGateway implements OnModuleDestroy, OnModuleInit {
  private until = new Subject<void>();

  private logger = new Logger(ImageEventGateway.name);

  constructor(private readonly eventBus: EventBus) {}

  onModuleDestroy() {
    this.until.next();
    this.until.complete();
  }
  onModuleInit() {
    this.eventBus
      .pipe(ofType(ImageConvertedEvent), takeUntil(this.until))
      .subscribe((event) => {
        this.server.emit('converted', event);
        this.logger.log(`Client notified: ${event.imageUrl}`);
      });
  }
  @WebSocketServer()
  public server: Server;
}
