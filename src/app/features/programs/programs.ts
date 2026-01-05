import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { AssistanceProgramService } from '../../core/services/assistance-program.service';
import { AssistanceProgram } from '../../shared/models/assistance-program.model';
import { SidenavService } from '../../common/side-nav/sidenav.service';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-programs',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './programs.html',
  styleUrl: './programs.scss',
})
export class Programs implements OnInit {
  private programService = inject(AssistanceProgramService);
  private sidenavService = inject(SidenavService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  programs: AssistanceProgram[] = [];
  displayedColumns: string[] = ['program_id', 'program_name', 'is_active', 'min_age', 'max_age', 'max_income_threshold', 'actions'];
  isDialogOpen = false;
  isEditMode = false;
  selectedProgram: AssistanceProgram | null = null;

  programForm: FormGroup = this.fb.group({
    program_name: ['', [Validators.required, Validators.minLength(2)]],
    is_active: [true],
    min_age: [null, Validators.min(0)],
    max_age: [null, Validators.min(0)],
    max_income_threshold: [null, Validators.min(0)]
  });

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.programService.getAll().subscribe({
      next: (data) => {
        this.programs = data;
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
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
          this.showError(`Failed to load programs: ${err?.message || `Status ${err?.status || 'Unknown error'}`}`);
        }
      }
    });
  }

  openAddDialog() {
    this.sidenavService.close();
    this.isEditMode = false;
    this.selectedProgram = null;
    this.programForm.reset({ is_active: true });
    this.isDialogOpen = true;
  }

  openEditDialog(program: AssistanceProgram) {
    this.isEditMode = true;
    this.selectedProgram = program;
    this.programForm.patchValue({
      program_name: program.program_name,
      is_active: program.is_active,
      min_age: program.min_age ?? null,
      max_age: program.max_age ?? null,
      max_income_threshold: program.max_income_threshold ?? null
    });
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.programForm.reset();
    this.selectedProgram = null;
  }

  saveProgram() {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }

    const formValue = this.programForm.value;
    const programData = {
      program_name: formValue.program_name,
      is_active: formValue.is_active,
      min_age: formValue.min_age ? Number(formValue.min_age) : undefined,
      max_age: formValue.max_age ? Number(formValue.max_age) : undefined,
      max_income_threshold: formValue.max_income_threshold ? Number(formValue.max_income_threshold) : undefined
    };

    if (this.isEditMode && this.selectedProgram) {
      this.programService.update(this.selectedProgram.program_id, programData).subscribe({
        next: () => {
          this.showSuccess('Program updated successfully');
          this.closeDialog();
          this.loadPrograms();
        },
        error: (err) => {
          this.showError('Failed to update program');
          console.error(err);
        }
      });
    } else {
      this.programService.create(programData).subscribe({
        next: () => {
          this.showSuccess('Program created successfully');
          this.closeDialog();
          this.loadPrograms();
        },
        error: (err) => {
          this.showError('Failed to create program');
          console.error(err);
        }
      });
    }
  }

  deleteProgram(program: AssistanceProgram) {
    if (confirm(`Are you sure you want to delete ${program.program_name}?`)) {
      this.programService.delete(program.program_id).subscribe({
        next: () => {
          this.showSuccess('Program deleted successfully');
          this.loadPrograms();
        },
        error: (err) => {
          this.showError('Failed to delete program');
          console.error(err);
        }
      });
    }
  }

  toggleActive(program: AssistanceProgram) {
    this.programService.update(program.program_id, { is_active: !program.is_active }).subscribe({
      next: () => {
        this.showSuccess(`Program ${!program.is_active ? 'activated' : 'deactivated'} successfully`);
        this.loadPrograms();
      },
      error: (err) => {
        this.showError('Failed to update program status');
        console.error(err);
      }
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}

