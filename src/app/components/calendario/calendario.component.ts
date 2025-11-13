import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Mantenimiento, Equipo } from '../../models/interfaces';

interface CalendarEvent {
  title: string;
  start: string;
  color: string;
  extendedProps: {
    mantenimiento: Mantenimiento;
  };
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  equipos: Equipo[] = [];
  events: CalendarEvent[] = [];
  mantenimientoSeleccionado: Mantenimiento | null = null;
  mostrarModal = false;
  currentMonth: Date = new Date();
  daysInMonth: number[] = [];
  firstDayOfMonth: number = 0;
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarMantenimientos();
    this.generateCalendar();
  }

  cargarEquipos(): void {
    this.apiService.getEquipos().subscribe({
      next: (data) => {
        this.equipos = data;
      },
      error: (error) => console.error('Error al cargar equipos:', error)
    });
  }

  cargarMantenimientos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
        this.createEvents();
      },
      error: (error) => console.error('Error al cargar mantenimientos:', error)
    });
  }

  createEvents(): void {
    this.events = this.mantenimientos.map(mant => ({
      title: `${this.getEquipoNombre(mant.id_equipo)} - ${mant.tipo_mantenimiento}`,
      start: mant.fecha_programada,
      color: this.getEventColor(mant.estado),
      extendedProps: {
        mantenimiento: mant
      }
    }));
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    this.firstDayOfMonth = new Date(year, month, 1).getDay();
    this.daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);
  }

  getEventColor(estado: string | undefined): string {
    if (!estado) return '#6c757d';
    
    const colors: { [key: string]: string } = {
      'Programado': '#0dcaf0',
      'En Proceso': '#ffc107',
      'Completado': '#198754',
      'Cancelado': '#dc3545'
    };
    return colors[estado] || '#6c757d';
  }

  getMantenimientosDelDia(day: number): Mantenimiento[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const fecha = new Date(year, month, day);
    const fechaStr = fecha.toISOString().split('T')[0];

    return this.mantenimientos.filter(m => {
      const mantFecha = new Date(m.fecha_programada).toISOString().split('T')[0];
      return mantFecha === fechaStr;
    });
  }

  getMantenimientosDelMes(): Mantenimiento[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    return this.mantenimientos.filter(m => {
      const mantDate = new Date(m.fecha_programada);
      return mantDate.getFullYear() === year && mantDate.getMonth() === month;
    }).sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime());
  }

  verDetalle(mantenimiento: Mantenimiento): void {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mantenimientoSeleccionado = null;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  // Métodos auxiliares
  getEquipoNombre(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    if (equipo?.marca && equipo?.modelo) {
      return `${equipo.marca} ${equipo.modelo}`;
    }
    return equipo?.numero_serie || `Equipo #${id}`;
  }

  getEquipoArea(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    return equipo?.nombre_area || 'Sin área';
  }

  getEquipoTipo(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    return equipo?.nombre_tipo || 'Sin tipo';
  }

  getBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-secondary';
    
    const classes: { [key: string]: string } = {
      'Programado': 'bg-info',
      'En Proceso': 'bg-warning',
      'Completado': 'bg-success',
      'Cancelado': 'bg-danger'
    };
    return classes[estado] || 'bg-secondary';
  }

  getTipoBadgeClass(tipo: string | undefined): string {
    if (!tipo) return 'bg-secondary';
    
    const classes: { [key: string]: string } = {
      'Preventivo': 'bg-primary',
      'Correctivo': 'bg-warning',
      'Inspección': 'bg-info'
    };
    return classes[tipo] || 'bg-secondary';
  }

  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }
}