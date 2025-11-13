// import { Routes } from '@angular/router';
// import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { EquiposComponent } from './components/equipos/equipos.component';
// import { MantenimientoComponent } from './components/mantenimiento/mantenimiento.component';
// import { CalendarioComponent } from './components/calendario/calendario.component';
// import { ConfiguracionComponent } from './components/configuracion/configuracion.component';

// export const routes: Routes = [
//   { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//   { path: 'dashboard', component: DashboardComponent },
//   { path: 'equipos', component: EquiposComponent },
//   { path: 'mantenimiento', component: MantenimientoComponent },
//   { path: 'calendario', component: CalendarioComponent },
//   { path: 'configuracion', component: ConfiguracionComponent }
// ];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EquiposComponent } from './components/equipos/equipos.component';
import { MantenimientoComponent } from './components/mantenimiento/mantenimiento.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { ReportesComponent } from './components/reportes/reportes.component'; 
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'equipos', 
    component: EquiposComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Solo admin
  },
  { 
    path: 'mantenimiento', 
    component: MantenimientoComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'calendario', 
    component: CalendarioComponent,
    canActivate: [AuthGuard]
  },
    { 
    path: 'reportes',  // 👈 NUEVO
    component: ReportesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  { 
    path: 'configuracion', 
    component: ConfiguracionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Solo admin
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];