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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApplicationService } from '../../core/services/application.service';
import { CitizenService } from '../../core/services/citizen.service';
import { AssistanceProgramService } from '../../core/services/assistance-program.service';
import { PermissionService } from '../../core/permission.service';
import { SidenavService } from '../../common/side-nav/sidenav.service';
import { TranslationService } from '../../core/services/translation.service';

import { Application, ApplicationStatus } from '../../shared/models/application';
import { Citizen } from '../../shared/models/citizen';
import { AssistanceProgram } from '../../shared/models/assistance-program.model';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocaleDatePipe } from '../../shared/pipes/locale-date.pipe';
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
    MatDialogModule,
    MatProgressSpinnerModule,
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

  displayedColumns: string[] = [
    'application_id',
    'citizen_name',
    'program_name',
    'status',
    'submission_date',
    'actions'
  ];

  isDialogOpen = false;
  isDraftDialogOpen = false;
  isLoading = false;
  isSubmitting = false;
  validationError: string | null = null;
  selectedDraft: Application | null = null;

  applicationForm: FormGroup = this.fb.group({
    citizen_id: ['', Validators.required],
    program_id: ['', Validators.required]
  });

  ngOnInit() {
    this.updateDisplayedColumns();
    this.loadApplications();
    this.loadCitizens();
    this.loadPrograms();
  }
  private updateDisplayedColumns(): void {
    this.displayedColumns = [
      'application_id',
      'citizen_name',
      'program_name',
      'status',
      'submission_date'
    ];
    if (
      this.canUpdate ||
      this.canDelete ||
    this.canApproveReject()
  ) {
      this.displayedColumns.push('actions');
    }
  }
  loadApplications() {
    this.isLoading = true;
    this.applicationService.getAll().subscribe({
      next: data => {
        this.applications = data.filter(a => a.status !== 'DRAFT');
        this.drafts = data.filter(a => a.status === 'DRAFT');
        this.isLoading = false;
      },
      error: err => {
        this.showError(this.translate('applications.messages.loadFailed'));
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadCitizens() {
    this.citizenService.getAll().subscribe({
      next: data => this.citizens = data,
      error: err => console.error(err)
    });
  }

  loadPrograms() {
    this.programService.getActive().subscribe({
      next: data => this.programs = data,
      error: err => console.error(err)
    });
  }

  openSubmitDialog() {
    if (!this.canCreate) {
      this.showError(this.translate('applications.messages.noPermissionCreate'));
      return;
    }

    this.sidenavService.close();
    this.applicationForm.reset();
    this.validationError = null;
    this.selectedDraft = null;
    this.isDialogOpen = true;
  }

  openDraftDialog(draft?: Application) {
    if(!this.canCreate){
      this.showError(this.translate('applications.messages.noPermissionCreate'));
      return
    }
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

  submitApplication() {
    if(!this.canCreate){
      this.showError(this.translate('applications.messages.noPermissionCreate'));
      return
    }
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const request = {
      citizen_id: Number(this.applicationForm.value.citizen_id),
      program_id: Number(this.applicationForm.value.program_id)
    };

    this.applicationService.submit(request).subscribe({
      next: () => {
        this.showSuccess(this.translate('applications.messages.submitSuccess'));
        this.closeDialog();
        this.loadApplications();
        this.isSubmitting = false;
      },
      error: err => this.handleSubmitError(err)
    });
  }

  saveAsDraft() {
    if(!this.canCreate){
      this.showError(this.translate('applications.messages.noPermissionCreate'));
      return
    }
    this.isSubmitting = true;

    const request = {
      citizen_id: Number(this.applicationForm.value.citizen_id),
      program_id: Number(this.applicationForm.value.program_id)
    };

    this.applicationService.saveDraft(request).subscribe({
      next: () => {
        this.showSuccess(this.translate('applications.messages.draftSaved'));
        this.closeDialog();
        this.loadApplications();
        this.isSubmitting = false;
      },
      error: err => {
        this.showError(this.translate('applications.messages.saveDraftFailed'));
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  updateStatus(application: Application, status: ApplicationStatus) {
    if(!this.canUpdate){
      this.showError(this.translate('applications.messages.noPermissionUpdate'));
      return
    }
    if ((status === 'APPROVED' || status === 'REJECTED') &&
      !this.permissionService.has('APPLICATION:APPROVE')) {
      this.showError(this.translate('applications.messages.noPermissionApprove'));
      return;
    }

    this.applicationService.updateStatus(application.application_id, status).subscribe({
      next: () => {
        this.showSuccess(this.translate('applications.messages.updateStatusSuccess'));
        this.loadApplications();
      },
      error: err => {
        this.showError(this.translate('applications.messages.updateStatusFailed'));
        console.error(err);
      }
    });
  }

  deleteApplication(application: Application) {
    if(!this.canDelete){
      this.showError(this.translate('applications.messages.noPermissionDelete'));
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: this.translate('applications.messages.deleteConfirm'),
        title: this.translate('common.delete')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.applicationService.delete(application.application_id).subscribe({
          next: () => {
            this.showSuccess(this.translate('applications.messages.deleteSuccess'));
            this.loadApplications();
          },
          error: err => {
            this.showError(this.translate('applications.messages.deleteFailed'));
            console.error(err);
          }
        });
      }
    });
  }

  getCitizenName(id: number): string {
    return this.citizens.find(c => c.citizen_id === id)?.full_name ?? `Citizen #${id}`;
  }

  getProgramName(id: number): string {
    return this.programs.find(p => p.program_id === id)?.program_name ?? `Program #${id}`;
  }

  private handleSubmitError(err: any) {
    this.validationError = this.translate('applications.errors.generic');
    this.isSubmitting = false;
  }

  private translate(key: string, params?: any): string {
    return this.translationService.translate(key, params);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }


  submitDraft(draft: Application) {
    if(!this.canCreate){
      this.showError(this.translate('applications.messages.noPermissionCreate'));
      return
    }
    this.selectedDraft = draft;
    this.applicationForm.patchValue({
      citizen_id: draft.citizen_id,
      program_id: draft.program_id
    });
    this.isDialogOpen = true;
    this.isDraftDialogOpen = false;
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

  get canView(): boolean {
    return this.permissionService.has('APPLICATION:VIEW');
  }
  get canCreate(): boolean {
    return this.permissionService.has('APPLICATION:CREATE');
  }
  get canUpdate(): boolean {
    return this.permissionService.has('APPLICATION:UPDATE');
  }
  get canDelete(): boolean {
    return this.permissionService.has('APPLICATION:DELETE');
  }

  canApproveReject(): boolean {
    return this.permissionService.has('APPLICATION:APPROVE');
  }

  canChangeToReview(): boolean {
    return true;
  }


}
