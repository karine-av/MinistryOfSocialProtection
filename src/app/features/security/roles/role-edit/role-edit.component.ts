import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { MatChipsModule } from '@angular/material/chips';


import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RoleService, RoleDetailsDto } from '../../../../core/services/role.service';

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
  selector: 'app-role-edit',
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
    MatChipsModule,

    TranslatePipe,
  ],
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss'],
})
export class RoleEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private snack = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roleId!: number;

  loadingRole = true;
  loadingMatrix = true;

  // role data
  usernames: string[] = [];

  // matrix
  matrixActions: ActionName[] = [];
  matrixDisplayedColumns: string[] = [];
  matrixRows: MatrixRow[] = [];

  // permissions diff
  originalPermissionIds = new Set<number>();
  selectedPermissionIds = new Set<number>();

  // users diff
  originalUsers = new Set<string>();
  selectedUsers = new Set<string>();

  usernameInput = this.fb.control<string>('', { nonNullable: true });


  form = this.fb.group({
    roleName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.roleId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.roleId || Number.isNaN(this.roleId)) {
      this.router.navigate(['/roles']);
      return;
    }

    this.loadRole();
    this.loadMatrix();
  }

  private loadRole() {
    this.loadingRole = true;

    this.roleService.getById(this.roleId).subscribe({
      next: (role: RoleDetailsDto) => {
        this.form.patchValue({ roleName: role.roleName });

        this.originalPermissionIds = new Set(role.permissionIds ?? []);
        this.selectedPermissionIds = new Set(role.permissionIds ?? []);

        const usernames = role.usernames ?? [];
        this.originalUsers = new Set(usernames);
        this.selectedUsers = new Set(usernames);


        this.loadingRole = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingRole = false;
        this.snack.open('Failed to load role', 'Close', { duration: 5000 });
        this.router.navigate(['/security/roles']);
      },
    });
  }

  private loadMatrix() {
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

  // checkbox helpers
  isChecked(p: PermissionDto | null): boolean {
    return !!p && this.selectedPermissionIds.has(p.id);
  }

  togglePermission(p: PermissionDto | null, checked: boolean) {
    if (!p) return;
    checked ? this.selectedPermissionIds.add(p.id) : this.selectedPermissionIds.delete(p.id);
  }

  selectRowAll(row: MatrixRow, checked: boolean) {
    for (const a of this.matrixActions) {
      const perm = row.actions[a];
      if (perm) this.togglePermission(perm, checked);
    }
  }

  clearAll() {
    this.selectedPermissionIds.clear();
  }

  // diffs
  private computeAddPermissionIds(): number[] {
    const add: number[] = [];
    for (const id of this.selectedPermissionIds) if (!this.originalPermissionIds.has(id)) add.push(id);
    return add;
  }

  private computeRemovePermissionIds(): number[] {
    const remove: number[] = [];
    for (const id of this.originalPermissionIds) if (!this.selectedPermissionIds.has(id)) remove.push(id);
    return remove;
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
      roleName: this.form.value.roleName ?? '',
      addUsers: this.computeAddUsers(),
      removeUsers: this.computeRemoveUsers(),
      addPermissionIds: this.computeAddPermissionIds(),
      removePermissionIds: this.computeRemovePermissionIds(),
    };


    this.roleService.patchRole(this.roleId, payload).subscribe({
      next: () => {
        this.snack.open('Role updated', 'Close', { duration: 2500 });
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Failed to update role', 'Close', { duration: 5000 });
      },
    });
  }

  get selectedUsersList(): string[] {
    return Array.from(this.selectedUsers).sort((a, b) => a.localeCompare(b));
  }

  addUsername() {
    const value = (this.usernameInput.value || '').trim();
    if (!value) return;

    this.selectedUsers.add(value);
    this.usernameInput.setValue('');
  }

  removeUsername(username: string) {
    this.selectedUsers.delete(username);
  }

  private computeAddUsers(): string[] {
    const add: string[] = [];
    for (const u of this.selectedUsers) if (!this.originalUsers.has(u)) add.push(u);
    return add;
  }

  private computeRemoveUsers(): string[] {
    const remove: string[] = [];
    for (const u of this.originalUsers) if (!this.selectedUsers.has(u)) remove.push(u);
    return remove;
  }

}
