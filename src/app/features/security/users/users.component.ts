import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UserService} from '../../../core/services/user.service';
import { User} from '../../../shared/models/user';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { PermissionService } from '../../../core/permission.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {RoleService} from '../../../core/services/role.service';
import {Role} from '../../../shared/models/role';
import {SidenavService} from '../../../common/side-nav/sidenav.service';
import {Router} from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';

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
    TranslatePipe,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private sidenavService = inject(SidenavService);
  private snackBar = inject(MatSnackBar);
  private permissionService = inject(PermissionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  users: User[] = [];
  displayedColumns: string[] = ['id', 'username', 'fullName', 'email', 'status', 'roles', 'actions'];
  isLoading = false;
  loadError: string | null = null;

  isDialogOpen = false;
  isSubmitting = false;

  roles: Role[] = [];
  hidePassword = true;

  userForm = this.fb.group({
    username: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    roleIds: [[] as number[]]
  });

  get canCreateUser(): boolean { return this.permissionService.has('USER:CREATE'); }
  get canUpdateUser(): boolean { return this.permissionService.has('USER:UPDATE'); }
  get canDeleteUser(): boolean { return this.permissionService.has('USER:DELETE'); }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getAll().subscribe({
      next: (roles) => this.roles = roles,
      error: () => this.showError('Failed to load roles')
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.loadError = null;

    this.userService.getAll().subscribe({
      next: (data) => { this.users = data; this.isLoading = false; },
      error: () => {
        this.loadError = 'Failed to load users. Please try again later.';
        this.showError(this.loadError);
        this.isLoading = false;
      }
    });
  }

  removeUser(user: User) {
    const confirmed = confirm(
      `Are you sure you want to delete user "${user.username}"?`
    );

    if (!confirmed) return;

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
      },
    });

    this.loadUsers();
  }

  openAddDialog() {
    this.sidenavService.close();
    this.userForm.reset();
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.userForm.value,
      roleIds: this.userForm.value.roleIds
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.closeDialog();
        this.loadUsers();
        this.isSubmitting = false;
        this.router.navigate(['/users']);
      },
      error: () => {
        this.showError('Failed to create user');
        this.isSubmitting = false;
      }
    });
    delete payload.roleIds;
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  formatRoles(roles: { name: string }[]): string {
    return roles.map(r => r.name).join(', ');
  }
}
