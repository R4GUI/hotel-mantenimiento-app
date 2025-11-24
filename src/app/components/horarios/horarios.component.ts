import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Horario } from '../../models/interfaces';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css'
})
export class HorariosComponent implements OnInit {
  horarios: Horario[] = [];
  mostrarModal = false;
  mostrarModalSemana = false;
  horarioActual: Horario = this.getHorarioVacio();
  modoEdicion = false;

  // Para horarios de semana
  fechaInicioSemana: string = '';
  empleadosMantenimiento = [
    { username: 'mantenimiento1', nombre: 'Mantenimiento 1', disponible: true, motivo: '' },
    { username: 'mantenimiento2', nombre: 'Mantenimiento 2', disponible: true, motivo: '' },
    { username: 'mantenimiento3', nombre: 'Mantenimiento 3', disponible: true, motivo: '' },
    { username: 'mantenimiento4', nombre: 'Mantenimiento 4', disponible: true, motivo: '' },
    { username: 'mantenimiento5', nombre: 'Mantenimiento 5', disponible: true, motivo: '' }
  ];

  // Filtros
  fechaFiltro: string = '';
  empleadoFiltro: string = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    // Establecer fecha actual como filtro por defecto
    this.fechaFiltro = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    if (this.fechaFiltro) {
      this.apiService.getHorariosByFecha(this.fechaFiltro).subscribe({
        next: (data) => {
          this.horarios = data;
        },
        error: (error) => {
          console.error('Error al cargar horarios:', error);
          this.toastService.error('Error al cargar los horarios');
        }
      });
    } else {
      this.apiService.getHorarios().subscribe({
        next: (data) => {
          this.horarios = data;
        },
        error: (error) => {
          console.error('Error al cargar horarios:', error);
          this.toastService.error('Error al cargar los horarios');
        }
      });
    }
  }

  aplicarFiltros(): void {
    this.cargarHorarios();
  }

  limpiarFiltros(): void {
    this.fechaFiltro = '';
    this.empleadoFiltro = '';
    this.cargarHorarios();
  }

  abrirModal(): void {
    this.horarioActual = this.getHorarioVacio();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirModalSemana(): void {
    this.fechaInicioSemana = new Date().toISOString().split('T')[0];
    this.empleadosMantenimiento.forEach(emp => {
      emp.disponible = true;
      emp.motivo = '';
    });
    this.mostrarModalSemana = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.horarioActual = this.getHorarioVacio();
  }

  cerrarModalSemana(): void {
    this.mostrarModalSemana = false;
  }

  editarHorario(horario: Horario): void {
    this.horarioActual = { ...horario };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardarHorario(): void {
    if (!this.horarioActual.username || !this.horarioActual.fecha) {
      this.toastService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    if (this.modoEdicion && this.horarioActual.id_horario) {
      this.apiService.updateHorario(this.horarioActual.id_horario, this.horarioActual).subscribe({
        next: () => {
          this.toastService.success('Horario actualizado exitosamente');
          this.cargarHorarios();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar horario:', error);
          this.toastService.error('Error al actualizar el horario');
        }
      });
    } else {
      this.apiService.createHorario(this.horarioActual).subscribe({
        next: () => {
          this.toastService.success('Horario creado exitosamente');
          this.cargarHorarios();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear horario:', error);
          this.toastService.error('Error al crear el horario');
        }
      });
    }
  }

  crearHorariosSemana(): void {
    if (!this.fechaInicioSemana) {
      this.toastService.warning('Por favor selecciona la fecha de inicio');
      return;
    }

    const data = {
      fechaInicio: this.fechaInicioSemana,
      empleados: this.empleadosMantenimiento
    };

    this.apiService.createHorariosSemana(data).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Horarios de la semana creados exitosamente');
        this.cargarHorarios();
        this.cerrarModalSemana();
      },
      error: (error) => {
        console.error('Error al crear horarios:', error);
        this.toastService.error('Error al crear los horarios');
      }
    });
  }

  eliminarHorario(id: string): void {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.apiService.deleteHorario(id).subscribe({
        next: () => {
          this.toastService.success('Horario eliminado exitosamente');
          this.cargarHorarios();
        },
        error: (error) => {
          console.error('Error al eliminar horario:', error);
          this.toastService.error('Error al eliminar el horario');
        }
      });
    }
  }

  getHorarioVacio(): Horario {
    return {
      username: '',
      fecha: new Date().toISOString().split('T')[0],
      disponible: true,
      motivo: ''
    };
  }

  getNombreEmpleado(username: string): string {
    const empleado = this.empleadosMantenimiento.find(e => e.username === username);
    return empleado ? empleado.nombre : username;
  }
}