import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocaleSelectorComponent } from '../../../common/locale-selector/locale-selector.component';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslationService } from '../../../core/services/translation.service';
import { SetPasswordService } from '../../../core/services/set-password.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSnackBarModule,
    TranslatePipe,
    LocaleSelectorComponent
  ],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  public localeService = inject(LocaleService);
  private translationService = inject(TranslationService);
  private setPasswordService = inject(SetPasswordService);
  private authService = inject(AuthService);
  private router = inject(Router);

  setPasswordForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isSubmitting = false;

  constructor() {
    this.setPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.{12,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*(.)\1\1).*$/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    });
  }

  onLocaleChange(locale: string) {
    this.localeService.setLocale(locale);
    this.translationService.setLocale(locale);
  }

  onSubmit(): void {
    this.setPasswordForm.markAllAsTouched();

    const password = this.setPasswordForm.get('password')?.value;
    const confirmPassword = this.setPasswordForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.setPasswordForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return;
    }

    if (this.setPasswordForm.invalid) return;

    this.isSubmitting = true;

    this.authService.getUserId().subscribe({
      next: (userId) => {
        if (!userId) {
          this.snackBar.open('User not found', 'Close', { duration: 5000 });
          this.isSubmitting = false;
          return;
        }

        this.setPasswordService.setPassword(userId, password).subscribe({
          next: () => {
            this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });

            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Failed to update password', 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to fetch user', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });

    const token = this.authService.getToken();

    if (token) {
      this.authService.logout(token).subscribe({
        next: () => {
          console.log('Logged out successfully');
          localStorage.removeItem('jwt');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout failed', err);
          localStorage.removeItem('jwt');
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }

  }
}
