import { Routes } from '@angular/router';
import { Citizens } from './features/citizens/citizens';
import { Programs } from './features/programs/programs';
import { Applications } from './features/applications/applications';
import { LoginComponent } from './pages/auth/login/login.component';
import { Analytics } from './features/analytics/analytics';

export const routes: Routes = [
  {
    path: 'citizens',
    component: Citizens
  },
  {
    path: 'programs',
    component: Programs
  },
  {
    path: 'applications',
    component: Applications
  },
  {
    path: 'analytics',
    component: Analytics
  },
  {
    path: "login",
    component: LoginComponent
  }
];
