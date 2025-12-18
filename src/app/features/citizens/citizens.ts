import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CitizenService } from '../../core/services/citizen.service';
import { Citizen } from '../../shared/models/citizen';
import { MaskIncomePipe } from '../../shared/pipes/mask-income.pipe';
import { PermissionService } from '../../core/permission.service';
import { SidenavService } from '../../common/side-nav/sidenav.service';

@Component({
  selector: 'app-citizens',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MaskIncomePipe
  ],
  templateUrl: './citizens.html',
  styleUrl: './citizens.scss',
})
export class Citizens implements OnInit {
  private citizenService = inject(CitizenService);
  private permissionService = inject(PermissionService);
  private sidenavService = inject(SidenavService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  citizens: Citizen[] = [];
  displayedColumns: string[] = ['citizen_id', 'full_name', 'national_id', 'date_of_birth', 'address', 'annual_income', 'actions'];
  searchQuery: string = '';
  isDialogOpen = false;
  isEditMode = false;
  selectedCitizen: Citizen | null = null;

  citizenForm: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    national_id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    date_of_birth: ['', Validators.required],
    address: ['', Validators.required],
    annual_income: ['', [Validators.required, Validators.min(0)]]
  });

  get canManageCitizens(): boolean {
    return this.permissionService.has('CITIZEN:MANAGE');
  }

  ngOnInit() {
    this.loadCitizens();
  }

  loadCitizens() {
    this.citizenService.getAll().subscribe({
      next: (data) => {
        this.citizens = data;
      },
      error: (err) => {
        // Log full error details for debugging
        console.error('Failed to load citizens:', err);
        console.error('Error details:', {
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          ok: err?.ok,
          error: err?.error,
          message: err?.message
        });

        // Check if response is HTML (backend not running)
        if (err?.error && typeof err.error === 'string' && err.error.includes('<!DOCTYPE')) {
          this.showError('Backend API not available. Please ensure the backend server is running on port 8080.');
        } else if (err?.status === 401 || err?.status === 403) {
          this.showError('Failed to load citizens (missing permission)');
        } else if (err?.status === 200 && !err?.ok) {
          this.showError('Invalid response from server. Check if backend API is running and returning JSON.');
        } else if (err?.status === 500) {
          this.showError('Backend server error (500). Please check if the backend server is running on port 8080 and accessible.');
        } else if (err?.status === 0 || err?.status === 504) {
          this.showError('Cannot connect to backend server. Please ensure the backend is running on port 8080.');
        } else {
          this.showError(`Failed to load citizens: ${err?.message || `Status ${err?.status || 'Unknown error'}`}`);
        }
      }
    });
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.loadCitizens();
      return;
    }

    this.citizenService.search(this.searchQuery).subscribe({
      next: (data) => {
        this.citizens = data;
      },
      error: (err) => {
        this.showError('Search failed');
        console.error(err);
      }
    });
  }

  openAddDialog() {
    if (!this.canManageCitizens) {
      this.showError('You do not have permission to add citizens');
      return;
    }
    this.sidenavService.close();
    this.isEditMode = false;
    this.selectedCitizen = null;
    this.citizenForm.reset();
    this.isDialogOpen = true;
  }

  openEditDialog(citizen: Citizen) {
    if (!this.canManageCitizens) {
      this.showError('You do not have permission to edit citizens');
      return;
    }
    this.isEditMode = true;
    this.selectedCitizen = citizen;
    this.citizenForm.patchValue({
      full_name: citizen.full_name,
      national_id: citizen.national_id,
      date_of_birth: citizen.date_of_birth.split('T')[0],
      address: citizen.address,
      annual_income: citizen.annual_income
    });
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.citizenForm.reset();
    this.selectedCitizen = null;
  }

  saveCitizen() {
    if (this.citizenForm.invalid) {
      this.citizenForm.markAllAsTouched();
      return;
    }

    const formValue = this.citizenForm.value;
    const citizenData = {
      ...formValue,
      date_of_birth: new Date(formValue.date_of_birth).toISOString(),
      annual_income: Number(formValue.annual_income)
    };

    if (this.isEditMode && this.selectedCitizen) {
      this.citizenService.update(this.selectedCitizen.citizen_id, citizenData).subscribe({
        next: () => {
          this.showSuccess('Citizen updated successfully');
          this.closeDialog();
          this.loadCitizens();
        },
        error: (err) => {
          this.showError('Failed to update citizen');
          console.error(err);
        }
      });
    } else {
      this.citizenService.create(citizenData).subscribe({
        next: () => {
          this.showSuccess('Citizen created successfully');
          this.closeDialog();
          this.loadCitizens();
        },
        error: (err) => {
          this.showError('Failed to create citizen');
          console.error(err);
        }
      });
    }
  }

  deleteCitizen(citizen: Citizen) {
    if (!this.canManageCitizens) {
      this.showError('You do not have permission to delete citizens');
      return;
    }
    if (confirm(`Are you sure you want to delete ${citizen.full_name}?`)) {
      this.citizenService.delete(citizen.citizen_id).subscribe({
        next: () => {
          this.showSuccess('Citizen deleted successfully');
          this.loadCitizens();
        },
        error: (err) => {
          this.showError('Failed to delete citizen');
          console.error(err);
        }
      });
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
