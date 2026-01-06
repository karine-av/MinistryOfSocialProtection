import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocaleSelectorComponent } from '../../../common/locale-selector/locale-selector.component';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslationService } from '../../../core/services/translation.service';

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
    TranslatePipe,
    LocaleSelectorComponent
  ],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent {
  setPasswordForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    public localeService: LocaleService,
    private translationService: TranslationService
  ) {
    this.setPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.{12,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*(.)\1\1).*$/)
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
    const password = this.setPasswordForm.get('password');
    const confirmPassword = this.setPasswordForm.get('confirmPassword');

    this.setPasswordForm.markAllAsTouched();

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return;
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }

    if (this.setPasswordForm.invalid) return;

    console.log('password set');
  }
}
