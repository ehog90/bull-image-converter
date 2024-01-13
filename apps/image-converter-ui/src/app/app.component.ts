import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  // #region Properties (7)

  public all = 0;
  public baseUrl = BASE_URL;
  public completed = 0;
  public converted: string[] = [];
  public files: File[] = [];
  public initialCompleted: number | null = null;
  public remaining = 0;

  // #endregion Properties (7)

  // #region Constructors (1)

  constructor(private readonly fileUploadService: FileUploadService) {}

  // #endregion Constructors (1)

  // #region Public Getters And Setters (1)

  public get sessionCompleted() {
    if (this.initialCompleted === null) {
      return null;
    }
    return this.completed - this.initialCompleted;
  }

  // #endregion Public Getters And Setters (1)

  // #region Public Methods (4)

  public ngOnInit(): void {
    const socket: Socket = io('http://localhost:3000');
    socket.on('stats', ({ remaining, completed }) => {
      this.pushStats(remaining, completed);
    });
    socket.on('newImage', ({ imageUrl, remaining, completed }) => {
      this.converted.push(imageUrl);
      this.remaining = remaining;
      this.pushStats(remaining, completed);
    });
  }

  public pickFiles(event: NgxDropzoneChangeEvent) {
    this.files.push(...event.addedFiles);
  }

  public removeFile(file: File) {
    this.files.splice(this.files.indexOf(file), 1);
  }

  public uploadFiles() {
    this.fileUploadService.uploadFiles(this.files);
    this.files = [];
  }

  // #endregion Public Methods (4)

  // #region Private Methods (1)

  private pushStats(remaining: number, completed: number) {
    this.remaining = remaining;
    if (this.initialCompleted === null) {
      this.initialCompleted = completed;
    }
    this.completed = completed;
    this.all = this.sessionCompleted ?? 0 + this.remaining;
  }

  // #endregion Private Methods (1)
}
