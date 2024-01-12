import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxDropzoneModule, NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { FileUploadService } from './services/file-upload.service';
import { io } from 'socket.io-client';
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
  files: File[] = [];
  converted: string[] = [];
  baseUrl = BASE_URL;

  constructor(private readonly fileUploadService: FileUploadService) {}
  ngOnInit(): void {
    const socket = io('http://localhost:3000');
    socket.on('converted', ({ imageUrl }) => {
      this.converted.push(imageUrl);
    });
  }

  pickFiles(event: NgxDropzoneChangeEvent) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  removeFile(file: File) {
    this.files.splice(this.files.indexOf(file), 1);
  }

  uploadFiles() {
    this.fileUploadService.uploadFiles(this.files);
    this.files = [];
  }
}
