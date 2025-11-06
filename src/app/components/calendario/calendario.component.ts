import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ApiService } from '../../services/api.service';
import { Mantenimiento } from '../../models/interfaces';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  mantenimientoSeleccionado: Mantenimiento | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    }
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarMantenimientos();
  }

  cargarMantenimientos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
        this.actualizarEventosCalendario();
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos:', error);
        alert('Error al cargar mantenimientos');
      }
    });
  }

  actualizarEventosCalendario(): void {
    const eventos = this.mantenimientos.map(mant => ({
      id: mant.id_mantenimiento?.toString(),
      title: `${mant.numero_serie} - ${mant.nombre_tipo}`,
      start: mant.fecha_programada,
      backgroundColor: this.getColorEvento(mant.estado || ''),
      borderColor: this.getColorEvento(mant.estado || ''),
      extendedProps: {
        mantenimiento: mant
      }
    }));

    this.calendarOptions.events = eventos;
  }

  getColorEvento(estado: string): string {
    switch(estado) {
      case 'Programado': return '#0dcaf0';
      case 'En proceso': return '#ffc107';
      case 'Completado': return '#198754';
      case 'Cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  }

  handleEventClick(clickInfo: any): void {
    this.mantenimientoSeleccionado = clickInfo.event.extendedProps.mantenimiento;
  }

  cerrarDetalle(): void {
    this.mantenimientoSeleccionado = null;
  }

  getBadgeClass(estado: string): string {
    switch(estado) {
      case 'Programado': return 'bg-info';
      case 'En proceso': return 'bg-warning';
      case 'Completado': return 'bg-success';
      case 'Cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTipoBadgeClass(tipo: string): string {
    switch(tipo) {
      case 'Preventivo': return 'bg-primary';
      case 'Correctivo': return 'bg-warning';
      case 'Inspección': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}