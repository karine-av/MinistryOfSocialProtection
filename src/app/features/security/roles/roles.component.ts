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
