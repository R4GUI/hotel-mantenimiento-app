import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Area, Tipo } from '../../models/interfaces';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {
  areas: Area[] = [];
  tipos: Tipo[] = [];
  
  areaSeleccionada: Area = { nombre_area: '', descripcion: '' };
  tipoSeleccionado: Tipo = { nombre_tipo: '', descripcion: '' };
  
  modoEdicionArea = false;
  modoEdicionTipo = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarAreas();
    this.cargarTipos();
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

  // === ÁREAS ===
  abrirModalArea(area?: Area): void {
    if (area) {
      this.areaSeleccionada = { ...area };
      this.modoEdicionArea = true;
    } else {
      this.areaSeleccionada = { nombre_area: '', descripcion: '' };
      this.modoEdicionArea = false;
    }
  }

  guardarArea(): void {
    if (!this.areaSeleccionada.nombre_area || this.areaSeleccionada.nombre_area.trim() === '') {
      alert('El nombre del área es obligatorio');
      return;
    }

    if (this.modoEdicionArea && this.areaSeleccionada.id_area) {
      // Actualizar
      this.apiService.updateArea(this.areaSeleccionada.id_area, this.areaSeleccionada).subscribe({
        next: () => {
          alert('Área actualizada exitosamente');
          this.cargarAreas();
          this.cerrarModal('areaModal');
        },
        error: (error) => {
          console.error('Error al actualizar área:', error);
          alert('Error al actualizar área');
        }
      });
    } else {
      // Crear
      this.apiService.createArea(this.areaSeleccionada).subscribe({
        next: () => {
          alert('Área agregada exitosamente');
          this.cargarAreas();
          this.cerrarModal('areaModal');
        },
        error: (error) => {
          console.error('Error al agregar área:', error);
          alert('Error al agregar área');
        }
      });
    }
  }

  eliminarArea(id: number): void {
    if (confirm('¿Está seguro de eliminar esta área?')) {
      this.apiService.deleteArea(id).subscribe({
        next: () => {
          alert('Área eliminada exitosamente');
          this.cargarAreas();
        },
        error: (error) => {
          console.error('Error al eliminar área:', error);
          alert('Error al eliminar área. Puede que tenga equipos asociados.');
        }
      });
    }
  }

  // === TIPOS ===
  abrirModalTipo(tipo?: Tipo): void {
    if (tipo) {
      this.tipoSeleccionado = { ...tipo };
      this.modoEdicionTipo = true;
    } else {
      this.tipoSeleccionado = { nombre_tipo: '', descripcion: '' };
      this.modoEdicionTipo = false;
    }
  }

  guardarTipo(): void {
    if (!this.tipoSeleccionado.nombre_tipo || this.tipoSeleccionado.nombre_tipo.trim() === '') {
      alert('El nombre del tipo es obligatorio');
      return;
    }

    if (this.modoEdicionTipo && this.tipoSeleccionado.id_tipo) {
      // Actualizar
      this.apiService.updateTipo(this.tipoSeleccionado.id_tipo, this.tipoSeleccionado).subscribe({
        next: () => {
          alert('Tipo actualizado exitosamente');
          this.cargarTipos();
          this.cerrarModal('tipoModal');
        },
        error: (error) => {
          console.error('Error al actualizar tipo:', error);
          alert('Error al actualizar tipo');
        }
      });
    } else {
      // Crear
      this.apiService.createTipo(this.tipoSeleccionado).subscribe({
        next: () => {
          alert('Tipo agregado exitosamente');
          this.cargarTipos();
          this.cerrarModal('tipoModal');
        },
        error: (error) => {
          console.error('Error al agregar tipo:', error);
          alert('Error al agregar tipo');
        }
      });
    }
  }

  eliminarTipo(id: number): void {
    if (confirm('¿Está seguro de eliminar este tipo?')) {
      this.apiService.deleteTipo(id).subscribe({
        next: () => {
          alert('Tipo eliminado exitosamente');
          this.cargarTipos();
        },
        error: (error) => {
          console.error('Error al eliminar tipo:', error);
          alert('Error al eliminar tipo. Puede que tenga equipos asociados.');
        }
      });
    }
  }

  cerrarModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
}