import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, ApplicationStatus } from '../../shared/models/application';

export interface ApplicationSubmissionRequest {
  citizen_id: number;
  program_id: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:1110/applications';

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl);
  }

  getById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  getByCitizenId(citizenId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/citizen/${citizenId}`);
  }

  getByProgramId(programId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/program/${programId}`);
  }

  submit(request: ApplicationSubmissionRequest): Observable<Application> {
    return this.http.post<Application>(
      `${this.apiUrl}?citizenId=${request.citizen_id}&programId=${request.program_id}&isDraft=false`,
      {}
    );
  }

  saveDraft(request: ApplicationSubmissionRequest): Observable<Application> {
    return this.http.post<Application>(
      `${this.apiUrl}?citizenId=${request.citizen_id}&programId=${request.program_id}&isDraft=true`,
      {}
    );
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
