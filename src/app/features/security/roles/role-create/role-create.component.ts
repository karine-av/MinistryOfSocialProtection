import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RoleService } from '../../../../core/services/role.service';

type ActionName = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW_SENSITIVE' | 'APPROVE';

interface PermissionDto {
  id: number;
  permissionName: ActionName;
  description: string;
}
interface PermissionMatrixCategoryDto {
  category: string;
  actions: Record<ActionName, PermissionDto | null>;
}
type PermissionMatrixResponse = Record<string, PermissionMatrixCategoryDto>;

interface MatrixRow {
  category: string;
  actions: Record<ActionName, PermissionDto | null>;
}

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,

    TranslatePipe,
  ],
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss'],
})
export class RoleCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  loadingMatrix = false;

  // matrix table
  matrixActions: ActionName[] = [];
  matrixDisplayedColumns: string[] = [];
  matrixRows: MatrixRow[] = [];

  // selected permissions
  selectedPermissionIds = new Set<number>();

  form = this.fb.group({
    roleName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadMatrix();
  }

  // --- load matrix ---
  loadMatrix() {
    this.loadingMatrix = true;

    this.roleService.getPermissionMatrix().subscribe({
      next: (matrix: PermissionMatrixResponse) => {
        this.matrixActions = this.getAllActions(matrix);
        this.matrixDisplayedColumns = ['category', ...this.matrixActions];

        this.matrixRows = Object.values(matrix)
          .map((v) => ({ category: v.category, actions: v.actions }))
          .sort((a, b) => a.category.localeCompare(b.category));

        this.loadingMatrix = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMatrix = false;
        this.snack.open('Failed to load permission matrix', 'Close', { duration: 5000 });
      },
    });
  }

  private getAllActions(matrix: PermissionMatrixResponse): ActionName[] {
    const set = new Set<ActionName>();
    for (const cat of Object.values(matrix)) {
      for (const a of Object.keys(cat.actions) as ActionName[]) set.add(a);
    }
    const order: ActionName[] = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE', 'APPROVE'];
    return order.filter((a) => set.has(a));
  }

  isChecked(p: PermissionDto | null): boolean {
    return !!p && this.selectedPermissionIds.has(p.id);
  }

  togglePermission(p: PermissionDto | null, checked: boolean) {
    if (!p) return;
    checked ? this.selectedPermissionIds.add(p.id) : this.selectedPermissionIds.delete(p.id);
  }

  selectRowAll(row: MatrixRow, checked: boolean) {
    for (const a of this.matrixActions) this.togglePermission(row.actions[a], checked);
  }

  clearAll() {
    this.selectedPermissionIds.clear();
  }

  cancel() {
    this.router.navigate(['/roles']);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      roleName: this.form.value.roleName!,
      permissionIds: Array.from(this.selectedPermissionIds),
    };

    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.snack.open('Role created', 'Close', { duration: 2500 });
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Failed to create role', 'Close', { duration: 5000 });
      },
    });
  }
}
