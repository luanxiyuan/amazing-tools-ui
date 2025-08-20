import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';
import { SharedStoreService } from '../common/shared-store.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private sharedStoreService: SharedStoreService
  ) { }
  
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(url, { params });
  }

  post<T>(url: string, body: any, params?: HttpParams): Observable<T> {
    return this.http.post<T>(url, body, { params });
  }

  put<T>(url: string, body: any, params?: HttpParams): Observable<T> {
    return this.http.put<T>(url, body, { params });
  }

  delete<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(url, { params });
  }

  downloadFile(url: string, filename: string, queryParams?: { [key: string]: any }): void {
    this.sharedStoreService.setLoading(true);
    axios({
      url: url,
      method: 'GET',
      responseType: 'blob', // important
      params: queryParams,
    }).then((response) => {
      this.sharedStoreService.setLoading(false);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    }).catch((error) => {
      this.sharedStoreService.setLoading(false);
      this.msg.error('Error downloading file');
      console.error('Error downloading file:', error);
    });
  }
  
}
