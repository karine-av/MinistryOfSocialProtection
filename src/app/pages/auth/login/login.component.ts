import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/services/auth.service';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocaleSelectorComponent } from '../../../common/locale-selector/locale-selector.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public localeService: LocaleService,
    private translationService: TranslationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLocaleChange(locale: string) {
    this.localeService.setLocale(locale);
    this.translationService.setLocale(locale);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const data = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.errorMessage = null;

    this.authService.login(data).pipe(
      switchMap(() => this.authService.isFirstLogin())
    ).subscribe({
      next: (firstLogin) => {
        if (firstLogin) {
          this.router.navigate(['/set-password']);
        } else {
          this.router.navigate(['/analytics']);
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = this.translationService.translate('wrong-credentials');
        } else {
          this.errorMessage = this.translationService.translate('generic-error');
        }
      }
    });
  }
}
