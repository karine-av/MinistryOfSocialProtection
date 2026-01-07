import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AssistanceProgram } from '../../shared/models/assistance-program.model';

@Injectable({ providedIn: 'root' })
export class AssistanceProgramService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:1110/programs';

  getAll(): Observable<AssistanceProgram[]> {
    return this.http.get<AssistanceProgram[]>(this.apiUrl);
  }

  getById(id: number): Observable<AssistanceProgram> {
    return this.http.get<AssistanceProgram>(`${this.apiUrl}/${id}`);
  }

  getActive(): Observable<AssistanceProgram[]> {
    return this.getAll().pipe(
      map(programs => programs.filter(p => p.is_active === true))
    );
  }

  create(
    program: Omit<AssistanceProgram, 'program_id' | 'createdAt' | 'updatedAt'>
  ): Observable<AssistanceProgram> {
    return this.http.post<AssistanceProgram>(this.apiUrl, program);
  }

  update(id: number, program: Partial<AssistanceProgram>): Observable<AssistanceProgram> {
    return this.http.put<AssistanceProgram>(`${this.apiUrl}/${id}`, program);
  }

  toggleActive(id: number): Observable<AssistanceProgram> {
    return this.http.patch<AssistanceProgram>(
      `${this.apiUrl}/${id}/active`,
      {}
    );
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
