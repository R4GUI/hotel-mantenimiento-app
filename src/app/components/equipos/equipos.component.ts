import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Equipo, Area, Tipo } from '../../models/interfaces';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipos.component.html',
  styleUrl: './equipos.component.css'
})
export class EquiposComponent implements OnInit {
  equipos: Equipo[] = [];
  areas: Area[] = [];
  tipos: Tipo[] = [];
  
  equipoSeleccionado: Equipo = this.nuevoEquipo();
  modoEdicion = false;
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarAreas();
    this.cargarTipos();
  }

nuevoEquipo(): Equipo {
  return {
    numero_serie: '',
    id_area: 0,
    id_tipo: 0,
    marca: '',
    modelo: '',
    fecha_adquisicion: '',
    estado: 'Operativo',  // SIEMPRE OPERATIVO AL CREAR
    observaciones: ''
  };
}

  cargarEquipos(): void {
    this.apiService.getEquipos().subscribe({
      next: (data) => {
        this.equipos = data;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        alert('Error al cargar equipos');
      }
    });
  }

  cargarAreas(): void {
    this.apiService.getAreas().subscribe({
      next: (data) => {
        this.areas = data;
      },
      error: (error) => {
        console.error('Error al cargar áreas:', error);
      }
    });
  }

  cargarTipos(): void {
    this.apiService.getTipos().subscribe({
      next: (data) => {
        this.tipos = data;
      },
      error: (error) => {
        console.error('Error al cargar tipos:', error);
      }
    });
  }

  abrirModal(equipo?: Equipo): void {
    if (equipo) {
      this.equipoSeleccionado = { ...equipo };
      this.modoEdicion = true;
    } else {
      this.equipoSeleccionado = this.nuevoEquipo();
      this.modoEdicion = false;
    }
  }

  guardarEquipo(): void {
    // Validaciones
    if (!this.equipoSeleccionado.numero_serie) {
      alert('El número de serie es obligatorio');
      return;
    }
    if (!this.equipoSeleccionado.id_area || this.equipoSeleccionado.id_area === 0) {
      alert('Debe seleccionar un área');
      return;
    }
    if (!this.equipoSeleccionado.id_tipo || this.equipoSeleccionado.id_tipo === 0) {
      alert('Debe seleccionar un tipo de equipo');
      return;
    }

    if (this.modoEdicion && this.equipoSeleccionado.id_equipo) {
      // Actualizar
      this.apiService.updateEquipo(this.equipoSeleccionado.id_equipo, this.equipoSeleccionado).subscribe({
        next: () => {
          alert('Equipo actualizado exitosamente');
          this.cargarEquipos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar equipo:', error);
          alert('Error al actualizar equipo');
        }
      });
    } else {
      // Crear
      this.apiService.createEquipo(this.equipoSeleccionado).subscribe({
        next: () => {
          alert('Equipo creado exitosamente');
          this.cargarEquipos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear equipo:', error);
          alert('Error al crear equipo');
        }
      });
    }
  }

  eliminarEquipo(id: number): void {
    if (confirm('¿Está seguro de eliminar este equipo?')) {
      this.apiService.deleteEquipo(id).subscribe({
        next: () => {
          alert('Equipo eliminado exitosamente');
          this.cargarEquipos();
        },
        error: (error) => {
          console.error('Error al eliminar equipo:', error);
          alert('Error al eliminar equipo');
        }
      });
    }
  }

  cerrarModal(): void {
    const modalElement = document.getElementById('equipoModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }

  getBadgeClass(estado: string): string {
    switch(estado) {
      case 'Operativo': return 'bg-success';
      case 'En mantenimiento': return 'bg-warning';
      case 'Fuera de servicio': return 'bg-danger';
      case 'Dado de baja': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}