import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Citizen } from '../../shared/models/citizen';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:1110/citizens';

  getAll(): Observable<Citizen[]> {
    return this.http.get<Citizen[]>(this.apiUrl);
  }

  getById(id: number): Observable<Citizen> {
    return this.http.get<Citizen>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Citizen[]> {
    if (!query || !query.trim()) {
      return this.getAll();
    }

    if (/^\d+$/.test(query)) {
      return this.searchByNationalId(query);
    }

    return this.searchByName(query);
  }

  private searchByNationalId(nationalId: string): Observable<Citizen[]> {
    return this.http.get<Citizen[]>(`${this.apiUrl}/search`, {
      params: { nationalId }
    });
  }

  private searchByName(name: string): Observable<Citizen[]> {
    return this.http.get<Citizen[]>(`${this.apiUrl}/search/name`, {
      params: { name }
    });
  }

  create(citizen: any): Observable<Citizen> {
    return this.http.post<Citizen>(this.apiUrl, citizen);
  }

  update(id: number, citizen: any): Observable<Citizen> {
    return this.http.put<Citizen>(`${this.apiUrl}/${id}`, citizen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
