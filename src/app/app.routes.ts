import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EquiposComponent } from './components/equipos/equipos.component';
import { MantenimientoComponent } from './components/mantenimiento/mantenimiento.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'equipos', component: EquiposComponent },
  { path: 'mantenimiento', component: MantenimientoComponent },
  { path: 'calendario', component: CalendarioComponent },
  { path: 'configuracion', component: ConfiguracionComponent }
];