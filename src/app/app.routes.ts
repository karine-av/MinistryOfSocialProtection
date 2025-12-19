import { Routes } from '@angular/router';
import { Dashboard} from './pages/dashboard/dashboard';
import { Citizens } from './features/citizens/citizens';
import { Programs } from './features/programs/programs';
import { Applications } from './features/applications/applications';
import { Analytics } from './features/analytics/analytics';
import { LoginComponent } from './pages/auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'citizens', component: Citizens
      },
      {
        path: 'programs', component: Programs
      },
      {
        path: 'applications', component: Applications
      },
      {
        path: 'analytics', component: Analytics
      },
      {
        path: '', redirectTo: 'analytics', pathMatch: 'full'
      }
    ]
  },

  {
    path: 'login',
    component: LoginComponent
  }
];
