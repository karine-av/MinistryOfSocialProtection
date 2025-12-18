import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Citizen } from '../../shared/models/citizen';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private http = inject(HttpClient);
  private apiUrl = '/api/citizens';

  getAll(): Observable<Citizen[]> {
    return this.http.get<Citizen[]>(this.apiUrl);
  }

  getById(id: number): Observable<Citizen> {
    return this.http.get<Citizen>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Citizen[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Citizen[]>(`${this.apiUrl}/search`, { params });
  }

  create(citizen: Omit<Citizen, 'citizen_id' | 'createdAt' | 'updatedAt'>): Observable<Citizen> {
    return this.http.post<Citizen>(this.apiUrl, citizen);
  }

  update(id: number, citizen: Partial<Citizen>): Observable<Citizen> {
    return this.http.put<Citizen>(`${this.apiUrl}/${id}`, citizen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

