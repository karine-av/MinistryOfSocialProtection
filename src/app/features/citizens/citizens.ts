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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CitizenService } from '../../core/services/citizen.service';
import { Citizen } from '../../shared/models/citizen';
import { HouseholdService } from '../../core/services/household.service';
import { MaskIncomePipe } from '../../shared/pipes/mask-income.pipe';
import { LocaleDatePipe } from '../../shared/pipes/locale-date.pipe';
import { LocaleCurrencyPipe } from '../../shared/pipes/locale-currency.pipe';
import { PermissionService } from '../../core/permission.service';
import { SidenavService } from '../../common/side-nav/sidenav.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

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
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    // MaskIncomePipe,
    LocaleDatePipe,
    LocaleCurrencyPipe,
    TranslatePipe
  ],
  templateUrl: './citizens.html',
  styleUrl: './citizens.scss',
})

export class Citizens implements OnInit {
  private citizenService = inject(CitizenService);
  private permissionService = inject(PermissionService);
  private sidenavService = inject(SidenavService);
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private householdService = inject(HouseholdService);

  citizens: Citizen[] = [];
  households: { id: number; label: string }[] = [];
  displayedColumns: string[] = [];
  searchQuery: string = '';
  isDialogOpen = false;
  isEditMode = false;
  selectedCitizen: Citizen | null = null;
  isLoading = false;
  isSubmitting = false;
  isInitialLoad = true;
  hasSearchQuery = false;
  loadError: string | null = null;
  private searchSubject = new Subject<string>();

  citizenForm: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    national_id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    date_of_birth: ['', Validators.required],
    address: ['', Validators.required],
    annual_income: ['', [Validators.required, Validators.min(0)]],
    household_id: [null]
  });

  get canViewCitizens(): boolean {
    return this.permissionService.has('CITIZEN:VIEW');
  }

  get canViewSensitive(): boolean {
    return this.permissionService.has('CITIZEN:VIEW_SENSITIVE');
  }

  get canCreateCitizen(): boolean {
    return this.permissionService.has('CITIZEN:CREATE');
  }

  get canUpdateCitizen(): boolean {
    return this.permissionService.has('CITIZEN:UPDATE');
  }

  get canDeleteCitizen(): boolean {
    return this.permissionService.has('CITIZEN:DELETE');
  }


  ngOnInit() {
    this.updateDisplayedColumns();
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.hasSearchQuery = true;
        this.performSearch(query);
      } else {
        this.hasSearchQuery = false;
        this.loadCitizens();
      }
    });

    this.loadCitizens();
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [
      'citizen_id',
      'full_name',
      'national_id',
      'date_of_birth',
      'address',
      'annual_income',
      'family'
    ];
    if (this.canUpdateCitizen || this.canDeleteCitizen) {
      this.displayedColumns.push('actions');
    }
  }
  private normalizeNationalId(value: string): string {
    if (!value) {
      return value;
    }
    return value.replace(/\D+/g, '');
  }

  get householdOptions() {
    return [
      ...this.households,
      { id: -1, label: '➕ Create new household' }
    ];
  }

  loadCitizens() {
    this.isLoading = true;
    this.loadError = null;

    this.citizenService.getAll().subscribe({
      next: (data) => {
        // 1️⃣ Normalize citizens
        this.citizens = data.map(citizen => ({
          ...citizen,
          national_id: this.normalizeNationalId(citizen.national_id)
        }));

        // 2️⃣ Build households safely (no undefined, no TS errors)
        const map = new Map<number, string[]>();

        this.citizens.forEach(citizen => {
          if (citizen.household_id != null) {
            if (!map.has(citizen.household_id)) {
              map.set(citizen.household_id, []);
            }
            map.get(citizen.household_id)!.push(citizen.full_name);
          }
        });

        this.households = Array.from(map.entries()).map(
          ([id, names]) => ({
            id,
            label: names.join(', ')
          })
        );

        this.isLoading = false;
        this.isInitialLoad = false;
        this.loadError = null;
      },

      error: (err) => {
        console.error('Failed to load citizens:', err);

        if (err?.error && typeof err.error === 'string' && err.error.includes('<!DOCTYPE')) {
          this.showError(this.translate('errors.backendNotAvailable'));
        } else if (err?.status === 401 || err?.status === 403) {
          this.showError(this.translate('errors.missingPermission'));
        } else if (err?.status === 500) {
          this.showError(this.translate('errors.serverError'));
        } else if (err?.status === 0 || err?.status === 504) {
          const errorMsg = this.translate('errors.connectionFailed');
          this.loadError = errorMsg;
          this.showError(errorMsg);
        } else {
          const errorMsg = this.translate(
            'citizens.messages.loadFailed',
            { message: err?.error?.message || this.translate('errors.generic') }
          );
          this.loadError = errorMsg;
          this.showError(errorMsg);
        }

        this.isLoading = false;
        this.isInitialLoad = false;
      }
    });
  }


  search() {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch(query: string) {
    this.isLoading = true;
    this.citizenService.search(query).subscribe({
      next: (data: Citizen[]) => {
        this.citizens = data.map(citizen => ({
          ...citizen,
          national_id: this.normalizeNationalId(citizen.national_id)
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        this.showError(this.translate('citizens.messages.searchFailed'));
        this.isLoading = false;
        console.error(err);
      }
    });
    }

  openAddDialog() {
    if (!this.canCreateCitizen) {
      this.showError(this.translate('citizens.messages.noPermissionAdd'));
      return;
    }
    this.sidenavService.close();
    this.isEditMode = false;
    this.selectedCitizen = null;
    this.citizenForm.reset();
    this.isDialogOpen = true;
  }

  // openEditDialog(citizen: Citizen) {
  //   if (!this.canUpdateCitizen) {
  //     this.showError(this.translate('citizens.messages.noPermissionEdit'));
  //     return;
  //   }
  //   this.isEditMode = true;
  //   this.selectedCitizen = citizen;
  //   this.citizenForm.patchValue({
  //     full_name: citizen.full_name,
  //     national_id: citizen.national_id,
  //     date_of_birth: citizen.date_of_birth.split('T')[0],
  //     address: citizen.address,
  //     annual_income: citizen.annual_income,
  //     parent_id: citizen.parent_id || null,
  //     children_ids: citizen.children_ids  || []
  //   });
  //   this.isDialogOpen = true;
  // }


  openEditDialog(citizen: Citizen) {
    if (!this.canUpdateCitizen) {
      this.showError(this.translate('citizens.messages.noPermissionEdit'));
      return;
    }

    this.isEditMode = true;
    this.selectedCitizen = citizen;

    this.citizenForm.patchValue({
      full_name: citizen.full_name,
      national_id: citizen.national_id,
      date_of_birth: citizen.date_of_birth.split('T')[0],
      address: citizen.address,
      annual_income: citizen.annual_income,
      household_id: citizen.household_id ?? null
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

    this.isSubmitting = true;
    const formValue = this.citizenForm.value;

    const isNewHousehold = formValue.household_id === -1;

    const createOrUpdateCitizen = (householdId: number | null) => {
      const citizenData = {
        full_name: formValue.full_name,
        national_id: formValue.national_id,
        date_of_birth: new Date(formValue.date_of_birth).toISOString(),
        address: formValue.address,
        annual_income: Number(formValue.annual_income),
        household_id: householdId
      };

      const request$ = this.isEditMode && this.selectedCitizen
        ? this.citizenService.update(this.selectedCitizen.citizen_id, citizenData)
        : this.citizenService.create(citizenData);

      request$.subscribe({
        next: () => {
          this.showSuccess(
            this.translate(
              this.isEditMode
                ? 'citizens.messages.updateSuccess'
                : 'citizens.messages.createSuccess'
            )
          );
          this.closeDialog();
          this.loadCitizens();
          this.isSubmitting = false;
        },
        error: err => {
          this.handleFormError(err, this.isEditMode ? 'update' : 'create');
          this.isSubmitting = false;
        }
      });
    };

    // 🔹 Create new household if needed
    if (isNewHousehold) {
      this.householdService.create().subscribe({
        next: household => {
          createOrUpdateCitizen(household.id);
        },
        error: () => {
          this.showError('Failed to create household');
          this.isSubmitting = false;
        }
      });
    } else {
      createOrUpdateCitizen(formValue.household_id ?? null);
    }
  }

  deleteCitizen(citizen: Citizen) {
    if (!this.canDeleteCitizen) {
      this.showError(this.translate('citizens.messages.noPermissionDelete'));
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: this.translate('citizens.messages.deleteConfirm', { name: citizen.full_name }),
        title: this.translate('common.delete')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.citizenService.delete(citizen.citizen_id).subscribe({
          next: () => {
            this.showSuccess(this.translate('citizens.messages.deleteSuccess'));
            this.loadCitizens();
            this.isLoading = false;
          },
          error: (err) => {
            this.showError(this.translate('citizens.messages.deleteFailed'));
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

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, this.translate('common.close'), { duration: 5000 });
  }

  getCitizenById(citizenId: number): Citizen | undefined {
    return this.citizens.find(c => c.citizen_id === citizenId);
  }

  calculateHouseholdIncome(citizen: Citizen): number {
    if (!citizen.household_id) {
      return citizen.annual_income;
    }

    return this.citizens
      .filter(c => c.household_id === citizen.household_id)
      .reduce((sum, c) => sum + c.annual_income, 0);
  }
  // calculateHouseholdIncome(citizen: Citizen): number {
  //   if (!citizen.parent_id) {
  //     // If no parent, check if this citizen has children
  //     const children = this.citizens.filter(c => c.parent_id === citizen.citizen_id);
  //     if (children.length === 0) {
  //       return citizen.annual_income;
  //     }
  //     // Sum this citizen's income with all children's income
  //     return citizen.annual_income + children.reduce((sum, child) => sum + child.annual_income, 0);
  //   } else {
  //     // If has parent, calculate household income from parent's perspective
  //     const parent = this.citizens.find(c => c.citizen_id === citizen.parent_id);
  //     if (!parent) {
  //       return citizen.annual_income;
  //     }
  //     const siblings = this.citizens.filter(c => c.parent_id === parent.citizen_id);
  //     return parent.annual_income + siblings.reduce((sum, sibling) => sum + sibling.annual_income, 0);
  //   }
  // }

  private handleFormError(err: any, operation: 'create' | 'update') {
    // Map backend errors to form fields
    if (err?.error?.field) {
      const field = err.error.field;
      const control = this.citizenForm.get(field);
      if (control) {
        control.setErrors({ backend: err.error.message });
        control.markAsTouched();
      }
      this.showError(this.translate(`citizens.errors.${field}`, { message: err.error.message }));
    } else {
      this.showError(this.translate(`citizens.messages.${operation}Failed`, { message: err?.error?.message || this.translate('errors.generic') }));
    }
    console.error(err);
  }

  // private buildHouseholds() {
  //   const map = new Map<number, number>();
  //
  //   this.citizens.forEach(c => {
  //     if (c.household_id) {
  //       map.set(
  //         c.household_id,
  //         (map.get(c.household_id) || 0) + 1
  //       );
  //     }
  //   });
  //
  //   this.households = Array.from(map.entries()).map(
  //     ([id, count]) => ({
  //       id,
  //       label: `Household #${id} (${count} members)`
  //     })
  //   );
  // }
}

