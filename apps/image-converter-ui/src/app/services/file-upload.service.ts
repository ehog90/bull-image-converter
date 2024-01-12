import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BASE_URL_API } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private readonly httpClient: HttpClient) {}

  public async uploadFiles(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file, file.name));
    await lastValueFrom(
      this.httpClient.post(`${BASE_URL_API}/upload`, formData)
    );
  }
}
