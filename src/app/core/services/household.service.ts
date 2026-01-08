import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:1110/households';

  create(): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, {});
  }

  addCitizen(householdId: number, citizenId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${householdId}/citizens/${citizenId}`,
      {}
    );
  }
}
