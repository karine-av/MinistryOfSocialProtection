import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ApplicationService } from '../../core/services/application.service';
import { CitizenService } from '../../core/services/citizen.service';
import { AssistanceProgramService } from '../../core/services/assistance-program.service';
import { PermissionService } from '../../core/permission.service';
import { SidenavService } from '../../common/side-nav/sidenav.service';
import { Application, ApplicationStatus } from '../../shared/models/application';
import { Citizen } from '../../shared/models/citizen';
import { AssistanceProgram } from '../../shared/models/assistance-program.model';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-applications',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    TranslatePipe
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications implements OnInit {
  private applicationService = inject(ApplicationService);
  private citizenService = inject(CitizenService);
  private programService = inject(AssistanceProgramService);
  private permissionService = inject(PermissionService);
  private sidenavService = inject(SidenavService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  applications: Application[] = [];
  citizens: Citizen[] = [];
  programs: AssistanceProgram[] = [];
  displayedColumns: string[] = ['application_id', 'citizen_name', 'program_name', 'status', 'submission_date', 'actions'];
  isDialogOpen = false;
  validationError: string | null = null;

  applicationForm: FormGroup = this.fb.group({
    citizen_id: ['', Validators.required],
    program_id: ['', Validators.required]
  });

  ngOnInit() {
    this.loadApplications();
    this.loadCitizens();
    this.loadPrograms();
  }

  loadApplications() {
    this.applicationService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
      },
      error: (err) => {
        console.error('Failed to load applications:', err);
        console.error('Error details:', {
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          ok: err?.ok,
          error: err?.error,
          message: err?.message
        });

        if (err?.error && typeof err.error === 'string' && err.error.includes('<!DOCTYPE')) {
          this.showError('Backend API not available. Please ensure the backend server is running on port 8080.');
        } else if (err?.status === 200 && !err?.ok) {
          this.showError('Invalid response from server. Check if backend API is running and returning JSON.');
        } else if (err?.status === 500) {
          this.showError('Backend server error (500). Please check if the backend server is running on port 8080 and accessible.');
        } else if (err?.status === 0 || err?.status === 504) {
          this.showError('Cannot connect to backend server. Please ensure the backend is running on port 8080.');
        } else {
          this.showError(`Failed to load applications: ${err?.message || `Status ${err?.status || 'Unknown error'}`}`);
        }
      }
    });
  }

  loadCitizens() {
    this.citizenService.getAll().subscribe({
      next: (data) => {
        this.citizens = data;
      },
      error: (err) => {
        console.error('Failed to load citizens:', err);
        if (err?.error && typeof err.error === 'string' && err.error.includes('<!DOCTYPE')) {
          console.warn('Backend API appears to be returning HTML instead of JSON. Is the backend server running?');
        }
      }
    });
  }

  loadPrograms() {
    this.programService.getActive().subscribe({
      next: (data) => {
        this.programs = data;
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
        if (err?.error && typeof err.error === 'string' && err.error.includes('<!DOCTYPE')) {
          console.warn('Backend API appears to be returning HTML instead of JSON. Is the backend server running?');
        }
      }
    });
  }

  openSubmitDialog() {
    this.sidenavService.close();
    this.validationError = null;
    this.applicationForm.reset();
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.applicationForm.reset();
    this.validationError = null;
  }

  submitApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.validationError = null;
    const formValue = this.applicationForm.value;

    this.applicationService.submit({
      citizen_id: Number(formValue.citizen_id),
      program_id: Number(formValue.program_id)
    }).subscribe({
      next: () => {
        this.showSuccess('Application submitted successfully');
        this.closeDialog();
        this.loadApplications();
      },
      error: (err) => {
        if (err.status === 400 && err.error?.message) {
          this.validationError = err.error.message;
        } else {
          this.showError('Failed to submit application');
          console.error(err);
        }
      }
    });
  }

  updateStatus(application: Application, newStatus: ApplicationStatus) {
    // Check permissions for APPROVED/REJECTED
    if ((newStatus === 'APPROVED' || newStatus === 'REJECTED') &&
      !this.permissionService.has('APPLICATION:APPROVE')) {
      this.showError('You do not have permission to approve/reject applications');
      return;
    }

    this.applicationService.updateStatus(application.application_id, newStatus).subscribe({
      next: () => {
        this.showSuccess(`Application status updated to ${newStatus}`);
        this.loadApplications();
      },
      error: (err) => {
        this.showError('Failed to update application status');
        console.error(err);
      }
    });
  }

  deleteApplication(application: Application) {
    if (confirm(`Are you sure you want to delete this application?`)) {
      this.applicationService.delete(application.application_id).subscribe({
        next: () => {
          this.showSuccess('Application deleted successfully');
          this.loadApplications();
        },
        error: (err) => {
          this.showError('Failed to delete application');
          console.error(err);
        }
      });
    }
  }

  getCitizenName(citizenId: number): string {
    const citizen = this.citizens.find(c => c.citizen_id === citizenId);
    return citizen ? citizen.full_name : `Citizen #${citizenId}`;
  }

  getProgramName(programId: number): string {
    const program = this.programs.find(p => p.program_id === programId);
    return program ? program.program_name : `Program #${programId}`;
  }

  getStatusColor(status: ApplicationStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'primary';
      case 'REJECTED':
        return 'warn';
      case 'REVIEW':
        return 'accent';
      default:
        return '';
    }
  }

  canApproveReject(): boolean {
    return this.permissionService.has('APPLICATION:APPROVE');
  }

  canChangeToReview(): boolean {
    return true; // Social workers can always change to REVIEW
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}

