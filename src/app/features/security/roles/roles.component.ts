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
import {MatTooltipModule} from '@angular/material/tooltip';
import {PermissionService} from '../../../core/permission.service';


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
    MatButton,
    MatTooltipModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private snackBar = inject(MatSnackBar);
  private permissionService = inject(PermissionService);

  roles: Role[] = [];
  displayedColumns: string[] = ['id', 'roleName', 'actions'];
  isLoading = false;
  loadError: string | null = null;

  ngOnInit() {
    this.loadRoles();
  }

  get canCreateRole(): boolean { return this.permissionService.has('ROLE:CREATE'); }
  get canUpdateRole(): boolean { return this.permissionService.has('ROLE:UPDATE'); }
  get canDeleteRole(): boolean { return this.permissionService.has('ROLE:DELETE'); }


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

  private router = inject(Router);

  openAddRole() {
    this.router.navigate(['/security/roles/create']);
  }

  editRole(role: Role) {
    this.router.navigate(['/security/roles', role.id, 'edit']);
  }

  removeRole(role: Role) {
    const confirmed = confirm(
      `Are you sure you want to delete role "${role.roleName}"?`
    );

    if (!confirmed) return;

    this.roleService.delete(role.id).subscribe({
      next: () => {
        this.snackBar.open('Role deleted', 'Close', { duration: 3000 });
        this.loadRoles();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete role', 'Close', { duration: 5000 });
      },
    });
  }
}
