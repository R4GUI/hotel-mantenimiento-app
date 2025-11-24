import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/interfaces';

@Component({
  selector: 'app-reporte-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-tickets.component.html',
  styleUrl: './reporte-tickets.component.css'
})
export class ReporteTicketsComponent implements OnInit {
  ticketsIncompletos: Ticket[] = [];
  cargando = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarTicketsIncompletos();
  }

  cargarTicketsIncompletos(): void {
    this.cargando = true;
    this.apiService.getTicketsIncompletos().subscribe({
      next: (data) => {
        this.ticketsIncompletos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar tickets incompletos:', error);
        this.toastService.error('Error al cargar el reporte');
        this.cargando = false;
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'En Proceso': return 'bg-primary';
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