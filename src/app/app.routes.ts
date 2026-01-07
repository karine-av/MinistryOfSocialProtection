
import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Citizens } from './features/citizens/citizens';
import { Programs } from './features/programs/programs';
import { Applications } from './features/applications/applications';
import { Analytics } from './features/analytics/analytics';
import { LoginComponent } from './pages/auth/login/login.component';
import { RolesComponent } from './features/security/roles/roles.component';
import { UsersComponent } from './features/security/users/users.component';
import { SetPasswordComponent } from './pages/auth/set-password/set-password.component';

import { authGuard } from './core/guards/auth.guard';
import {RoleCreateComponent} from './features/security/roles/role-create/role-create.component';
import {RoleEditComponent} from './features/security/roles/role-edit/role-edit.component';
// import { RoleCreateComponent } from './pages/security/roles/role-create/role-create.component';


export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: 'citizens', component: Citizens },
      { path: 'programs', component: Programs },
      { path: 'applications', component: Applications },
      { path: 'analytics', component: Analytics },
      { path: 'roles', component: RolesComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      {
        path: 'set-password',
        component: SetPasswordComponent
      }
    ]
  },

  {
    path: 'login',
    component: LoginComponent
  },

  { path: 'security/roles', component: RolesComponent },
  { path: 'security/roles/create', component: RoleCreateComponent },
  { path: 'security/roles/:id/edit', component: RoleEditComponent },


];

