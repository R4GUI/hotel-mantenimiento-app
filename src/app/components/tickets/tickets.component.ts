import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/interfaces';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  mostrarModal = false;
  nuevoTicket: Ticket = this.getTicketVacio();
  currentUsername: string = '';

  // Opciones para el formulario
  areas = ['Recepción', 'Restaurante', 'Habitaciones', 'Lavandería', 'Mantenimiento', 'Jardines', 'Estacionamiento'];
  pisos = ['Planta Baja', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5'];
  prioridades: ('Baja' | 'Media' | 'Alta' | 'Urgente')[] = ['Baja', 'Media', 'Alta', 'Urgente'];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    const user = this.authService.currentUserValue;
    this.currentUsername = user?.username || '';
  }

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.apiService.getTickets().subscribe({
      next: (data) => {
        // Filtrar solo los tickets creados por el usuario actual
        this.tickets = data.filter(t => t.creado_por === this.currentUsername);
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.toastService.error('Error al cargar los tickets');
      }
    });
  }

  abrirModal(): void {
    this.nuevoTicket = this.getTicketVacio();
    this.nuevoTicket.creado_por = this.currentUsername;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevoTicket = this.getTicketVacio();
  }

crearTicket(): void {
  if (!this.nuevoTicket.area || !this.nuevoTicket.piso || !this.nuevoTicket.descripcion_problema) {
    this.toastService.warning('Por favor completa todos los campos obligatorios');
    return;
  }

  this.apiService.createTicket(this.nuevoTicket).subscribe({
    next: (response: any) => { // 👈 CAMBIAR a "any" para que acepte el message
      this.toastService.success(response.message || 'Ticket creado exitosamente');
      this.cargarTickets();
      this.cerrarModal();
    },
    error: (error) => {
      console.error('Error al crear ticket:', error);
      this.toastService.error(error.error?.error || 'Error al crear el ticket');
    }
  });
}

  getTicketVacio(): Ticket {
    return {
      area: '',
      piso: '',
      habitacion: '',
      descripcion_problema: '',
      prioridad: 'Media',
      creado_por: this.currentUsername,
      asignado_a: '',
      estado: 'Pendiente',
      fecha_creacion: new Date().toISOString(),
      fecha_limite: new Date().toISOString()
    };
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
}