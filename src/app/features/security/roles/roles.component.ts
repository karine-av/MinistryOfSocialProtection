// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
//
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatTableModule } from '@angular/material/table';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
//
// import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
// import { SidenavService } from '../../../common/side-nav/sidenav.service';
//
// type ActionName = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW_SENSITIVE' | 'APPROVE';
//
// interface PermissionDto {
//   id: number;
//   permissionName: ActionName;
//   description: string;
// }
//
// interface PermissionMatrixCategoryDto {
//   category: string;
//   actions: Record<ActionName, PermissionDto | null>;
// }
//
// type PermissionMatrixResponse = Record<string, PermissionMatrixCategoryDto>;
//
// interface MatrixRow {
//   category: string;
//   actions: Record<ActionName, PermissionDto | null>;
// }
//
// interface RoleDto {
//   id: number;
//   roleName: string;
// }
//
// @Component({
//   selector: 'app-roles',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     HttpClientModule,
//
//     MatToolbarModule,
//     MatTableModule,
//     MatButtonModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatCheckboxModule,
//     MatTooltipModule,
//     MatSnackBarModule,
//
//     TranslatePipe,
//   ],
//   templateUrl: './roles.html',
//   styleUrl: './roles.scss',
// })
// export class Roles implements OnInit {
//   private http = inject(HttpClient);
//   private fb = inject(FormBuilder);
//   private snackBar = inject(MatSnackBar);
//   private sidenavService = inject(SidenavService);
//
//   // roles list
//   isLoading = false;
//   roles: RoleDto[] = [];
//   displayedColumns: string[] = ['id', 'roleName'];
//
//   // create dialog state
//   isDialogOpen = false;
//   matrixLoading = false;
//
//   roleForm = this.fb.group({
//     roleName: ['', [Validators.required, Validators.minLength(2)]],
//   });
//
//   // matrix
//   matrixActions: ActionName[] = [];
//   matrixDisplayedColumns: string[] = [];
//   matrixRows: MatrixRow[] = [];
//
//   // selected permissions
//   selectedPermissionIds = new Set<number>();
//
//   ngOnInit(): void {
//     this.loadRoles();
//   }
//
//   // -------------------------
//   // Roles list
//   // -------------------------
//   loadRoles() {
//     this.isLoading = true;
//
//     // adjust endpoint if your roles list endpoint is different
//     this.http.get<RoleDto[]>('http://localhost:8080/api/roles').subscribe({
//       next: (data) => {
//         this.roles = data;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error(err);
//         this.isLoading = false;
//         this.showError('Failed to load roles');
//       },
//     });
//   }
//
//   // -------------------------
//   // Dialog open/close
//   // -------------------------
//   openAddDialog() {
//     this.sidenavService.close();
//
//     this.isDialogOpen = true;
//     this.roleForm.reset({ roleName: '' });
//     this.selectedPermissionIds.clear();
//
//     this.loadPermissionMatrix();
//   }
//
//   closeDialog() {
//     this.isDialogOpen = false;
//     this.roleForm.reset();
//     this.selectedPermissionIds.clear();
//   }
//
//   // -------------------------
//   // Matrix loading
//   // -------------------------
//   private loadPermissionMatrix() {
//     this.matrixLoading = true;
//
//     this.http.get<PermissionMatrixResponse>('http://localhost:8080/api/permissions/matrix').subscribe({
//       next: (matrix) => {
//         this.matrixActions = this.getAllActions(matrix);
//         this.matrixDisplayedColumns = ['category', ...this.matrixActions];
//
//         this.matrixRows = Object.values(matrix)
//           .map((v) => ({ category: v.category, actions: v.actions }))
//           .sort((a, b) => a.category.localeCompare(b.category));
//
//         this.matrixLoading = false;
//       },
//       error: (err) => {
//         console.error(err);
//         this.matrixLoading = false;
//         this.showError('Failed to load permission matrix');
//       },
//     });
//   }
//
//   private getAllActions(matrix: PermissionMatrixResponse): ActionName[] {
//     const set = new Set<ActionName>();
//     for (const cat of Object.values(matrix)) {
//       for (const a of Object.keys(cat.actions) as ActionName[]) set.add(a);
//     }
//
//     // stable order
//     const order: ActionName[] = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE', 'APPROVE'];
//     return order.filter((a) => set.has(a));
//   }
//
//   // -------------------------
//   // Checkbox helpers
//   // -------------------------
//   isChecked(p: PermissionDto | null): boolean {
//     return !!p && this.selectedPermissionIds.has(p.id);
//   }
//
//   togglePermission(p: PermissionDto | null, checked: boolean) {
//     if (!p) return;
//     if (checked) this.selectedPermissionIds.add(p.id);
//     else this.selectedPermissionIds.delete(p.id);
//   }
//
//   selectRowAll(row: MatrixRow, checked: boolean) {
//     for (const action of this.matrixActions) {
//       this.togglePermission(row.actions[action], checked);
//     }
//   }
//
//   clearAll() {
//     this.selectedPermissionIds.clear();
//   }
//
//   // -------------------------
//   // Create role (POST)
//   // -------------------------
//   createRole() {
//     if (this.roleForm.invalid) {
//       this.roleForm.markAllAsTouched();
//       return;
//     }
//
//     const payload = {
//       roleName: this.roleForm.value.roleName!,
//       permissionIds: Array.from(this.selectedPermissionIds).sort((a, b) => a - b),
//     };
//
//     this.http.post('http://localhost:8080/api/roles', payload).subscribe({
//       next: () => {
//         this.showSuccess('Role created successfully');
//         this.closeDialog();
//         this.loadRoles();
//       },
//       error: (err) => {
//         console.error(err);
//         this.showError('Failed to create role');
//       },
//     });
//   }
//
//   private showSuccess(message: string) {
//     this.snackBar.open(message, 'Close', { duration: 3000 });
//   }
//
//   private showError(message: string) {
//     this.snackBar.open(message, 'Close', { duration: 5000 });
//   }
// }
//



import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Role } from '../../../shared/models/role';
import { RoleService } from '../../../core/services/role.service';
import {MatButton} from '@angular/material/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    TranslatePipe,
    MatButton
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private snackBar = inject(MatSnackBar);

  roles: Role[] = [];
  displayedColumns: string[] = ['id', 'roleName'];
  // displayedColumns: string[] = ['id', 'roleName', 'permissions'];
  isLoading = false;
  loadError: string | null = null;

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;
    this.loadError = null;

    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.isLoading = false;
      },
      error: (err) => {
        // console.error('failed to load roles:', err);
        this.loadError = 'Failed to load roles. Please try again later.';
        this.showError(this.loadError);
        this.isLoading = false;
      }
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  // formatPermissions(permissions: { name: string }[]): string {
  //   return permissions.map(p => p.name).join(', ');
  // }
  private router = inject(Router);

  openAddRole() {
    this.router.navigate(['/security/roles/create']);
  }

}
