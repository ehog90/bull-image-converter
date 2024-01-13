import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgxDropzoneModule, NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { FileUploadService } from './services/file-upload.service';
import { Socket, io } from 'socket.io-client';
import { BASE_URL } from './utils';

@Component({
  standalone: true,
  imports: [NgxDropzoneModule, HttpClientModule],
  providers: [FileUploadService],
  selector: 'image-converter-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // #region Properties (12)

  private readonly fileUploadService = inject(FileUploadService);

  public all = signal(0)
  public baseUrl = BASE_URL;
  public completed = signal(0);
  public converted = signal<string[]>([])
  public emptyFiles = computed(() => {
    return this.files().length === 0
  })
  public files = signal<File[]>([])
  public initialCompleted = signal<number | null>(null);
  public progressBarValue = computed(() => {
    const sessionCompleted = this.sessionCompleted() ?? 0
    return sessionCompleted / (sessionCompleted + this.remaining())
  })
  public remaining = signal(0)
  public sessionCompleted = computed(() => {
    const initialCompleted = this.initialCompleted();
    if (initialCompleted === null) {
      return null;
    }
    return this.completed() - initialCompleted
  })
  public showProgressText = computed(() => {
   return  this.sessionCompleted() !== null && this.completed() !== 0 && this.remaining() !== 0
  })

  // #endregion Properties (12)

  // #region Public Methods (4)

  public ngOnInit(): void {
    const socket: Socket = io('http://localhost:3000');
    socket.on('stats', ({ remaining, completed }) => {
      this.pushStats(remaining, completed);
    });
    socket.on('newImage', ({ imageUrl, remaining, completed }) => {
      this.converted.update(c => [...c, imageUrl])
      this.remaining.set(remaining);
      this.pushStats(remaining, completed);
    });
  }

  public pickFiles(event: NgxDropzoneChangeEvent) {
    this.files.update(f => [...f, ...event.addedFiles])
  }

  public removeFile(file: File) {
    this.files.update(files => files.filter(f => f != file))
  }

  public uploadFiles() {
    this.fileUploadService.uploadFiles(this.files());
    this.files.set([]);
    this.completed.set(0)
  }

  // #endregion Public Methods (4)

  // #region Private Methods (1)

  private pushStats(remaining: number, completed: number) {
    this.remaining.set(remaining);
    if (this.initialCompleted() === null) {
      this.initialCompleted.set(completed)
    }
    this.completed.set(completed);
    this.all.set(this.sessionCompleted() ?? 0 + this.remaining());
  }

  // #endregion Private Methods (1)
}
