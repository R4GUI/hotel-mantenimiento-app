import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/interfaces';

@Component({
  selector: 'app-para-hoy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './para-hoy.component.html',
  styleUrl: './para-hoy.component.css'
})
export class ParaHoyComponent implements OnInit {
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;
  mostrarModalObservaciones = false;
  observaciones: string = '';
  currentUsername: string = '';
  horaActual: number = new Date().getHours();
  puedeCompletar: boolean = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    const user = this.authService.currentUserValue;
    this.currentUsername = user?.username || '';
    this.verificarHorario();
  }

  ngOnInit(): void {
    this.cargarTicketsHoy();
    
    // Actualizar la hora cada minuto
    setInterval(() => {
      this.verificarHorario();
    }, 60000); // 60000ms = 1 minuto
  }

  verificarHorario(): void {
    this.horaActual = new Date().getHours();
    this.puedeCompletar = this.horaActual < 20; // Antes de las 8 PM
  }

  cargarTicketsHoy(): void {
    this.apiService.getTicketsByResponsable(this.currentUsername).subscribe({
      next: (data) => {
        // Filtrar solo tickets de hoy que no estén completados
        const hoy = new Date().toISOString().split('T')[0];
        this.tickets = data.filter(t => {
          const fechaCreacion = new Date(t.fecha_creacion).toISOString().split('T')[0];
          return fechaCreacion === hoy && t.estado !== 'Completado' && t.estado !== 'Cancelado';
        });
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.toastService.error('Error al cargar los tickets');
      }
    });
  }

  iniciarTicket(ticket: Ticket): void {
    if (ticket.id_ticket) {
      this.apiService.updateTicket(ticket.id_ticket, { 
        estado: 'En Proceso' 
      }).subscribe({
        next: () => {
          this.toastService.success('Ticket iniciado');
          this.cargarTicketsHoy();
        },
        error: (error) => {
          console.error('Error al iniciar ticket:', error);
          this.toastService.error('Error al iniciar el ticket');
        }
      });
    }
  }

  abrirModalObservaciones(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.observaciones = ticket.observaciones_mantenimiento || '';
    this.mostrarModalObservaciones = true;
  }

  cerrarModalObservaciones(): void {
    this.mostrarModalObservaciones = false;
    this.ticketSeleccionado = null;
    this.observaciones = '';
  }

  guardarObservaciones(): void {
    if (this.ticketSeleccionado?.id_ticket) {
      this.apiService.updateTicket(this.ticketSeleccionado.id_ticket, {
        observaciones_mantenimiento: this.observaciones
      }).subscribe({
        next: () => {
          this.toastService.success('Observaciones guardadas');
          this.cargarTicketsHoy();
          this.cerrarModalObservaciones();
        },
        error: (error) => {
          console.error('Error al guardar observaciones:', error);
          this.toastService.error('Error al guardar las observaciones');
        }
      });
    }
  }

  completarTicket(ticket: Ticket): void {
    if (!this.puedeCompletar) {
      this.toastService.error('No se puede completar el ticket después de las 8:00 PM');
      return;
    }

    if (ticket.id_ticket) {
      this.apiService.updateTicket(ticket.id_ticket, {
        estado: 'Completado'
      }).subscribe({
        next: () => {
          this.toastService.success('Ticket completado exitosamente');
          this.cargarTicketsHoy();
        },
        error: (error) => {
          console.error('Error al completar ticket:', error);
          this.toastService.error(error.error?.error || 'Error al completar el ticket');
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'En Proceso': return 'bg-primary';
      case 'Completado': return 'bg-success';
      case 'Cancelado': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getPrioridadBadgeClass(prioridad: string): string {
    switch(prioridad) {
      case 'Baja': return 'bg-info';
      case 'Media': return 'bg-warning text-dark';
      case 'Alta': return 'bg-orange text-white';
      case 'Urgente': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPrioridadIcon(prioridad: string): string {
    switch(prioridad) {
      case 'Baja': return 'bi-arrow-down-circle';
      case 'Media': return 'bi-dash-circle';
      case 'Alta': return 'bi-arrow-up-circle';
      case 'Urgente': return 'bi-exclamation-triangle-fill';
      default: return 'bi-circle';
    }
  }
}