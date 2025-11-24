import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EquiposComponent } from './components/equipos/equipos.component';
import { MantenimientoComponent } from './components/mantenimiento/mantenimiento.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { TicketsComponent } from './components/tickets/tickets.component'; // 👈 NUEVO
import { ParaHoyComponent } from './components/para-hoy/para-hoy.component'; // 👈 NUEVO
import { HorariosComponent } from './components/horarios/horarios.component'; // 👈 NUEVO
import { ReporteTicketsComponent } from './components/reporte-tickets/reporte-tickets.component'; // 👈 NUEVO

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Dashboard (Admin)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // 👇 NUEVAS RUTAS PARA SISTEMA DE TICKETS
  
  // Tickets (Ama de Llaves)
  { 
    path: 'tickets', 
    component: TicketsComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['amadellaves'] }
  },
  
  // Para Hoy (Mantenimiento y Admin)
  { 
    path: 'para-hoy', 
    component: ParaHoyComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['mantenimiento', 'admin'] }
  },
  
  // Horarios (Solo Admin)
  { 
    path: 'horarios', 
    component: HorariosComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // Reporte Tickets Incompletos (Solo Admin)
  { 
    path: 'reporte-tickets', 
    component: ReporteTicketsComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // 👇 RUTAS EXISTENTES
  
  // Equipos (Solo Admin)
  { 
    path: 'equipos', 
    component: EquiposComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // Mantenimiento (Admin y Mantenimiento)
  { 
    path: 'mantenimiento', 
    component: MantenimientoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'mantenimiento'] }
  },
  
  // Calendario (Admin y Mantenimiento)
  { 
    path: 'calendario', 
    component: CalendarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'mantenimiento'] }
  },
  
  // Reportes (Solo Admin)
  { 
    path: 'reportes', 
    component: ReportesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // Configuración (Solo Admin)
  { 
    path: 'configuracion', 
    component: ConfiguracionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  
  // Redirecciones
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];