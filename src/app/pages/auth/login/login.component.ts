import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { TranslatePipe} from '../../../shared/pipes/translate.pipe';
import { FormsModule} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { LocaleSelectorComponent} from '../../../common/locale-selector/locale-selector.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    TranslatePipe,
    FormsModule,
    MatSelectModule,
    LocaleSelectorComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  selectedLocale = 'en';
  supportedLocales = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'hy', name: 'Հայերեն' }
  ];

  onLocaleChange(locale: string) {
    this.selectedLocale = locale;
  }


  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        // console.log('Login successful, JWT:', res.token);
        this.router.navigate(['/analytics']);
      },
      error: (err) => {
        // console.error('Login failed:', err);
        // alert('Login failed! Please check your username and password.');
      }
    });
  }
}
