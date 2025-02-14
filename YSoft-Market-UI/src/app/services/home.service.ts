import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  GetAllNews() {
    return this.http.get(`${this.baseUrl}api/Home/GetAllNews`);
  }

  GetNewsById(id: number) {
    return this.http.get(`${this.baseUrl}api/Home/GetNewsById/${id}`);
  }

  AddUpdateNews(News: FormData) {
    return this.http.post(`${this.baseUrl}api/Home/AddUpdateNews`, News);
  }

  DeleteNews(id: number) {
    return this.http.delete(`${this.baseUrl}api/Home/DeleteNews/${id}`);
  }

  UpdateSelected(selectedNews: number) {
    return this.http.post<number>(
      `${this.baseUrl}api/Home/UpdateSelection`,
      selectedNews
    );
  }
}
