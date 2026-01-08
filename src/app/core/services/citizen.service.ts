import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Citizen } from '../../shared/models/citizen';
import { CitizenRequest } from '../../shared/models/citizen-request';


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

    // national id = digits only
    if (/^\d+$/.test(query)) {
      return this.http
        .get<Citizen>(`${this.apiUrl}/search`, { params: { nationalId: query } })
        .pipe(map(c => (c ? [c] : [])));
    }

    return this.http.get<Citizen[]>(`${this.apiUrl}/search/name`, {
      params: { name: query }
    });
  }


  create(citizen: CitizenRequest): Observable<Citizen> {
    return this.http.post<Citizen>(this.apiUrl, citizen);
  }

  update(id: number, citizen: CitizenRequest): Observable<Citizen> {
    return this.http.put<Citizen>(`${this.apiUrl}/${id}`, citizen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
