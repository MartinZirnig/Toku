import { Injectable } from '@angular/core';
import { Server } from '../server';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResultModel } from '../models/result-model';
import { User } from '../user';
import { __param } from 'tslib';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly baseUrl: string = Server.Url + "/file"; 

  constructor(private http: HttpClient) {}

  saveUserFile(fromData: FormData, fileName: string) : Observable<RequestResultModel> {
    const path = this.baseUrl + "/upload-user/" + User.InnerId;
    console.log("Saving user file to: " + path);
    let params = new HttpParams();
    params = params.append("fileName", fileName);
    return this.http.put<RequestResultModel>(path, fromData, {params: params});
  }
  saveGroupFile(fromData: FormData, fileName: string) : Observable<RequestResultModel> {
    const path = this.baseUrl + "/upload-group/" + User.InnerId;
    let params = new HttpParams();
    params = params.append("fileName", fileName);
    return this.http.put<RequestResultModel>(path, fromData, {params: params});
  }
  saveSecretUserFile(fromData: FormData, fileName: string) : Observable<RequestResultModel> {
    const path = this.baseUrl + "/upload-user-secret/" + User.InnerId;
    let params = new HttpParams();
    params = params.append("fileName", fileName);
    return this.http.put<RequestResultModel>(path, fromData, {params: params});
  }
  saveSecretGroupFile(fromData: FormData, fileName: string) : Observable<RequestResultModel> {
    const path = this.baseUrl + "/upload-group-secret/" + User.InnerId;
    let params = new HttpParams();
    params = params.append("fileName", fileName);
    return this.http.put<RequestResultModel>(path, fromData, {params: params});
  }

  getUserFile(fileId: string): Observable<any> {
    const path = this.baseUrl + "/get-file/" + fileId;

    return this.http.get(path, {
      responseType: 'blob', 
      observe: 'response',
    });
  }
  getGroupFile(fileId: string): Observable<any> {
    const path = this.baseUrl + "/get-file/" + fileId;

    return this.http.get(path, {
      responseType: 'blob', 
      observe: 'response',
    });
  }
  getGroupSecret(fileId: string) {
    const path = this.baseUrl + "/get-secret-file/" + fileId;

    return this.http.get(path, {
      responseType: 'blob', 
      observe: 'response',
    });
  }
}
