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
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocaleDatePipe } from '../../shared/pipes/locale-date.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

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
    MatProgressSpinnerModule,
    MatDialogModule,
    LocaleDatePipe,
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
  private translationService = inject(TranslationService);
  private sidenavService = inject(SidenavService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  applications: Application[] = [];
  drafts: Application[] = [];
  citizens: Citizen[] = [];
  programs: AssistanceProgram[] = [];
  displayedColumns: string[] = ['application_id', 'citizen_name', 'program_name', 'status', 'submission_date', 'actions'];
  isDialogOpen = false;
  isDraftDialogOpen = false;
  validationError: string | null = null;
  isLoading = false;
  isSubmitting = false;
  selectedDraft: Application | null = null;

  applicationForm: FormGroup = this.fb.group({
    citizen_id: ['', Validators.required],
    program_id: ['', Validators.required]
  });

  ngOnInit() {
    this.loadApplications();
    this.loadDrafts();
    this.loadCitizens();
    this.loadPrograms();
  }

  loadApplications() {
    this.isLoading = true;
    this.applicationService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
        this.isLoading = false;
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
          this.showError(this.translate('errors.backendNotAvailable'));
        } else if (err?.status === 200 && !err?.ok) {
          this.showError(this.translate('errors.invalidResponse'));
        } else if (err?.status === 500) {
          this.showError(this.translate('errors.serverError'));
        } else if (err?.status === 0 || err?.status === 504) {
          this.showError(this.translate('errors.connectionFailed'));
        } else {
          this.showError(this.translate('applications.messages.loadFailed', { message: err?.error?.message  || this.translate('errors.generic') }));
        }
        this.isLoading = false;
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
    this.selectedDraft = null;
    this.isDialogOpen = true;
  }

  openDraftDialog(draft?: Application) {
    this.sidenavService.close();
    this.validationError = null;
    if (draft) {
      this.selectedDraft = draft;
      this.applicationForm.patchValue({
        citizen_id: draft.citizen_id,
        program_id: draft.program_id
      });
    } else {
      this.selectedDraft = null;
      this.applicationForm.reset();
    }
    this.isDraftDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.isDraftDialogOpen = false;
    this.applicationForm.reset();
    this.validationError = null;
    this.selectedDraft = null;
  }

  loadDrafts() {
    this.applicationService.getDrafts().subscribe({
      next: (data) => {
        this.drafts = data;
      },
      error: (err) => {
        console.error('Failed to load drafts:', err);
      }
    });
  }

  submitApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.validationError = null;
    const formValue = this.applicationForm.value;
    const request = {
      citizen_id: Number(formValue.citizen_id),
      program_id: Number(formValue.program_id)
    };

  // If editing a draft, update it first, then submit
    if (this.selectedDraft) {
      this.applicationService.updateDraft(this.selectedDraft.application_id, request).subscribe({
        next: () => {
          // After updating draft, submit it
          this.applicationService.submit(request).subscribe({
            next: () => {
              this.showSuccess(this.translate('applications.messages.submitSuccess'));
              this.closeDialog();
              this.loadApplications();
              this.loadDrafts();
              this.isSubmitting = false;
            },
            error: (err) => this.handleSubmitError(err)
          });
        },
        error: (err) => {
          this.showError(this.translate('applications.messages.saveDraftFailed'));
          this.isSubmitting = false;
          console.error(err);
        }
      });
    } else {
      this.applicationService.submit(request).subscribe({
        next: () => {
          this.showSuccess(this.translate('applications.messages.submitSuccess'));
          this.closeDialog();
          this.loadApplications();
          this.isSubmitting = false;
        },
        error: (err) => this.handleSubmitError(err)
      });
    }
  }

  saveAsDraft() {
    // Drafts bypass validation - allow saving incomplete forms
    this.isSubmitting = true;
    this.validationError = null;
    const formValue = this.applicationForm.value;
    const request = {
      citizen_id: Number(formValue.citizen_id),
      program_id: Number(formValue.program_id)
    };

    if (this.selectedDraft) {
      // Update existing draft
      this.applicationService.updateDraft(this.selectedDraft.application_id, request).subscribe({
        next: () => {
          this.showSuccess(this.translate('applications.messages.draftSaved'));
          this.closeDialog();
          this.loadDrafts();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.showError(this.translate('applications.messages.saveDraftFailed'));
          this.isSubmitting = false;
          console.error(err);
        }
      });
    } else {
      // Create new draft
      this.applicationService.saveDraft(request).subscribe({
        next: () => {
          this.showSuccess(this.translate('applications.messages.draftSaved'));
          this.closeDialog();
          this.loadDrafts();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.showError(this.translate('applications.messages.saveDraftFailed'));
          this.isSubmitting = false;
          console.error(err);
        }
      });
    }
  }

  submitDraft(draft: Application) {
    // Open the submit dialog with the draft pre-filled
    this.selectedDraft = draft;
    this.applicationForm.patchValue({
      citizen_id: draft.citizen_id,
      program_id: draft.program_id
    });
    this.isDialogOpen = true;
    this.isDraftDialogOpen = false;
  }

  private handleSubmitError(err: any) {
    if (err.status === 400 && err.error?.message) {
      // Parse and translate validation errors
      const errorMessage = err.error.message;
      if (errorMessage.includes('age') || errorMessage.includes('Age')) {
        this.validationError = this.translate('applications.errors.ageNotInRange');
      } else if (errorMessage.includes('income') || errorMessage.includes('Income')) {
        this.validationError = this.translate('applications.errors.incomeTooHigh');
      } else if (errorMessage.includes('already') || errorMessage.includes('Already')) {
        this.validationError = this.translate('applications.errors.alreadyApplied');
      } else {
        this.validationError = this.translate('applications.errors.generic') + ': ' + errorMessage;
      }
    } else {
      this.showError(this.translate('applications.messages.submitFailed'));
      console.error(err);
    }
    this.isSubmitting = false;
  }

  updateStatus(application: Application, newStatus: ApplicationStatus) {
    // Check permissions for APPROVED/REJECTED
    if ((newStatus === 'APPROVED' || newStatus === 'REJECTED') &&
    !this.permissionService.has('APPLICATION:APPROVE')) {
      this.showError(this.translate('applications.messages.noPermissionApprove'));
      return;
    }

    this.isLoading = true;
    this.applicationService.updateStatus(application.application_id, newStatus).subscribe({
      next: () => {
        this.showSuccess(this.translate('applications.messages.updateStatusSuccess').replace('{{status}}', newStatus));
        this.loadApplications();
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(this.translate('applications.messages.updateStatusFailed'));
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  deleteApplication(application: Application) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: this.translate('applications.messages.deleteConfirm'),
        title: this.translate('common.delete')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.applicationService.delete(application.application_id).subscribe({
          next: () => {
            this.showSuccess(this.translate('applications.messages.deleteSuccess'));
            this.loadApplications();
            this.isLoading = false;
          },
          error: (err) => {
            this.showError(this.translate('applications.messages.deleteFailed'));
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    });
  }

  private translate(key: string, params?: { [key: string]: string | number }): string {
    return this.translationService.translate(key, params);
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
