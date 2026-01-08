import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/permission.service';
import { SidenavService } from '../../../common/side-nav/sidenav.service';

import { User } from '../../../shared/models/user';
import { Role } from '../../../shared/models/role';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private sidenavService = inject(SidenavService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  users: User[] = [];
  roles: Role[] = [];

  displayedColumns: string[] = [
    'id',
    'username',
    'fullName',
    'email',
    'status',
    'roles',
    'actions'
  ];

  isLoading = false;
  isDialogOpen = false;
  isSubmitting = false;
  hidePassword = true;

  editingUserId: number | null = null;

  userForm = this.fb.group({
    username: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], // required only on create
    roleIds: [[] as number[]]
  });

  get canCreateUser(): boolean {
    return this.permissionService.has('USER:CREATE');
  }
  get canUpdateUser(): boolean {
    return this.permissionService.has('USER:UPDATE');
  }
  get canDeleteUser(): boolean {
    return this.permissionService.has('USER:DELETE');
  }

  ngOnInit(): void {
    // IMPORTANT: load roles first, then users (so we can map role names -> Role objects)
    this.loadRolesThenUsers();
  }

  // ===== Load roles FIRST, then load users and map roles =====
  private loadRolesThenUsers(): void {
    this.isLoading = true;

    this.roleService.getAll().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loadUsers(); // after roles are ready
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load roles');
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (usersFromApi: any[]) => {
        // Backend returns roles as string[] (role names)
        // We convert them into Role[] to match your User interface
        this.users = usersFromApi.map((u) => ({
          ...u,
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : null,
          roles: this.roles.filter((r) => Array.isArray(u.roles) && u.roles.includes(r.roleName))
        })) as User[];

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load users');
      }
    });
  }

  // ===== Dialog handling =====
  openAddDialog(): void {
    this.sidenavService.close();
    this.editingUserId = null;
    this.setCreateValidators();

    this.userForm.reset({
      username: '',
      fullName: '',
      email: '',
      password: '',
      roleIds: []
    });

    this.isDialogOpen = true;
  }

  openEditDialog(user: User): void {
    this.sidenavService.close();
    this.editingUserId = user.id;
    this.setEditValidators();

    this.userForm.reset({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      roleIds: user.roles.map(r => r.id) // ✅ preselect roles
    });

    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.isSubmitting = false;
    this.editingUserId = null;
    this.userForm.reset();
  }

  // ===== Save (Create / Update) =====
  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.userForm.value;

    const payload: any = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      roleIds: formValue.roleIds ?? []
    };

    // Only send password if it was provided
    if (formValue.password && formValue.password.trim()) {
      payload.password = formValue.password;
    }

    // CREATE
    if (!this.editingUserId) {
      this.userService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.closeDialog();
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to create user');
          this.isSubmitting = false;
        }
      });
      return;
    }

    // UPDATE
    this.userService.update(this.editingUserId, payload).subscribe({
      next: () => {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.closeDialog();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to update user');
        this.isSubmitting = false;
      }
    });
  }

  // ===== Delete =====
  removeUser(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete user "${user.username}"?`);
    if (!confirmed) return;

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to delete user');
      }
    });
  }

  // ===== Validators helpers =====
  private setCreateValidators(): void {
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  private setEditValidators(): void {
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // ===== Utils =====
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  formatRoles(user: User): string {
    if (!user.roles || user.roles.length === 0) {
      return '';
    }
    return user.roles.map(role => role.roleName).join(', ');
  }

}



// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { MatCardModule } from '@angular/material/card';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
// import { UserService} from '../../../core/services/user.service';
// import { User} from '../../../shared/models/user';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButton } from '@angular/material/button';
// import { PermissionService } from '../../../core/permission.service';
// import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import {RoleService} from '../../../core/services/role.service';
// import {Role} from '../../../shared/models/role';
// import {SidenavService} from '../../../common/side-nav/sidenav.service';
// import {Router} from '@angular/router';
// import {MatTooltipModule} from '@angular/material/tooltip';
//
// @Component({
//   selector: 'app-users',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatTableModule,
//     MatCardModule,
//     MatToolbarModule,
//     MatProgressSpinnerModule,
//     MatSnackBarModule,
//     MatIconModule,
//     TranslatePipe,
//     MatButton,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatTooltipModule
//   ],
//   templateUrl: './users.component.html',
//   styleUrls: ['./users.component.scss'],
// })
// export class UsersComponent implements OnInit {
//   private userService = inject(UserService);
//   private roleService = inject(RoleService);
//   private sidenavService = inject(SidenavService);
//   private snackBar = inject(MatSnackBar);
//   private permissionService = inject(PermissionService);
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//
//   users: User[] = [];
//   displayedColumns: string[] = ['id', 'username', 'fullName', 'email', 'status', 'roles', 'actions'];
//   isLoading = false;
//   loadError: string | null = null;
//
//   isDialogOpen = false;
//   isSubmitting = false;
//
//   roles: Role[] = [];
//   hidePassword = true;
//
//   userForm = this.fb.group({
//     username: ['', Validators.required],
//     fullName: ['', Validators.required],
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', Validators.required],
//     roleIds: [[] as number[]]
//   });
//
//   get canCreateUser(): boolean { return this.permissionService.has('USER:CREATE'); }
//   get canUpdateUser(): boolean { return this.permissionService.has('USER:UPDATE'); }
//   get canDeleteUser(): boolean { return this.permissionService.has('USER:DELETE'); }
//
//   ngOnInit() {
//     this.loadUsers();
//     this.loadRoles();
//   }
//
//   loadRoles() {
//     this.roleService.getAll().subscribe({
//       next: (roles) => this.roles = roles,
//       error: () => this.showError('Failed to load roles')
//     });
//   }
//
//   loadUsers() {
//     this.isLoading = true;
//     this.loadError = null;
//
//     this.userService.getAll().subscribe({
//       next: (data) => { this.users = data; this.isLoading = false; },
//       error: () => {
//         this.loadError = 'Failed to load users. Please try again later.';
//         this.showError(this.loadError);
//         this.isLoading = false;
//       }
//     });
//   }
//
//   removeUser(user: User) {
//     const confirmed = confirm(
//       `Are you sure you want to delete user "${user.username}"?`
//     );
//
//     if (!confirmed) return;
//
//     this.userService.delete(user.id).subscribe({
//       next: () => {
//         this.snackBar.open('User deleted', 'Close', { duration: 3000 });
//         this.loadUsers();
//       },
//       error: (err) => {
//         console.error(err);
//         this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
//       },
//     });
//
//     this.loadUsers();
//   }
//
//   openAddDialog() {
//     this.sidenavService.close();
//     this.userForm.reset();
//     this.isDialogOpen = true;
//   }
//
//   closeDialog() {
//     this.isDialogOpen = false;
//     this.userForm.reset();
//   }
//
//   saveUser() {
//     if (this.userForm.invalid) {
//       this.userForm.markAllAsTouched();
//       return;
//     }
//
//     this.isSubmitting = true;
//
//     const payload = {
//       ...this.userForm.value,
//       roleIds: this.userForm.value.roleIds
//     };
//
//     this.userService.create(payload).subscribe({
//       next: () => {
//         this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
//         this.closeDialog();
//         this.loadUsers();
//         this.isSubmitting = false;
//         this.router.navigate(['/users']);
//       },
//       error: () => {
//         this.showError('Failed to create user');
//         this.isSubmitting = false;
//       }
//     });
//     delete payload.roleIds;
//   }
//
//   private showError(message: string) {
//     this.snackBar.open(message, 'Close', { duration: 5000 });
//   }
//
//   formatRoles(roles: { name: string }[]): string {
//     return roles.map(r => r.name).join(', ');
//   }
// }
