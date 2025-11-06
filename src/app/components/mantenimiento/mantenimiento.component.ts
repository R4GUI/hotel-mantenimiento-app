import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Mantenimiento, Equipo, Refaccion, ReporteMantenimiento } from '../../models/interfaces';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.css'
})
export class MantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  equipos: Equipo[] = [];
  refacciones: Refaccion[] = [];
  refaccionesReporte: Refaccion[] = [];
  
  mantenimientoSeleccionado: Mantenimiento = this.nuevoMantenimiento();
  refaccionNueva: Refaccion = this.nuevaRefaccion();
  reporteActual: ReporteMantenimiento | null = null;
  
  modoEdicion = false;
  mantenimientoParaRefaccion: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarMantenimientos();
    this.cargarEquipos();
  }

  nuevoMantenimiento(): Mantenimiento {
    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];
    
    return {
      id_equipo: 0,
      fecha_programada: fechaFormateada,
      fecha_iniciado: '',
      fecha_realizado: '',
      responsable: '',
      tipo_mantenimiento: 'Preventivo',
      estado: 'Programado',
      descripcion_trabajo: '',
      observaciones: ''
    };
  }

  nuevaRefaccion(): Refaccion {
    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];
    
    return {
      id_mantenimiento: 0,
      folio_compra: '',
      descripcion: '',
      cantidad: 1,
      costo_unitario: 0,
      proveedor: '',
      fecha_compra: fechaFormateada
    };
  }

  cargarMantenimientos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos:', error);
        alert('Error al cargar mantenimientos');
      }
    });
  }

  cargarEquipos(): void {
    this.apiService.getEquipos().subscribe({
      next: (data) => {
        this.equipos = data;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
      }
    });
  }

  cargarRefacciones(idMantenimiento: number): void {
    this.apiService.getRefaccionesByMantenimiento(idMantenimiento).subscribe({
      next: (data) => {
        this.refacciones = data;
      },
      error: (error) => {
        console.error('Error al cargar refacciones:', error);
      }
    });
  }

  abrirModal(mantenimiento?: Mantenimiento): void {
    if (mantenimiento) {
      if (mantenimiento.estado !== 'Programado') {
        alert('No se puede editar un mantenimiento que ya ha iniciado');
        return;
      }
      this.mantenimientoSeleccionado = { ...mantenimiento };
      this.modoEdicion = true;
    } else {
      this.mantenimientoSeleccionado = this.nuevoMantenimiento();
      this.modoEdicion = false;
    }
  }

  abrirModalRefacciones(mantenimiento: Mantenimiento): void {
    this.mantenimientoParaRefaccion = mantenimiento.id_mantenimiento!;
    this.refaccionNueva = this.nuevaRefaccion();
    this.cargarRefacciones(mantenimiento.id_mantenimiento!);
  }

  guardarMantenimiento(): void {
    if (!this.mantenimientoSeleccionado.id_equipo || this.mantenimientoSeleccionado.id_equipo === 0) {
      alert('Debe seleccionar un equipo');
      return;
    }
    if (!this.mantenimientoSeleccionado.fecha_programada) {
      alert('La fecha programada es obligatoria');
      return;
    }
    if (!this.mantenimientoSeleccionado.responsable || this.mantenimientoSeleccionado.responsable.trim() === '') {
      alert('El responsable es obligatorio');
      return;
    }
    const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/;
    if (!soloLetras.test(this.mantenimientoSeleccionado.responsable)) {
      alert('El responsable solo debe contener letras');
      return;
    }

    if (this.modoEdicion && this.mantenimientoSeleccionado.id_mantenimiento) {
      this.apiService.updateMantenimiento(this.mantenimientoSeleccionado.id_mantenimiento, this.mantenimientoSeleccionado).subscribe({
        next: () => {
          alert('Mantenimiento actualizado exitosamente');
          this.cargarMantenimientos();
          this.cerrarModal('mantenimientoModal');
        },
        error: (error) => {
          console.error('Error al actualizar mantenimiento:', error);
          alert('Error al actualizar mantenimiento');
        }
      });
    } else {
      this.apiService.createMantenimiento(this.mantenimientoSeleccionado).subscribe({
        next: () => {
          alert('Mantenimiento programado exitosamente');
          this.cargarMantenimientos();
          this.cerrarModal('mantenimientoModal');
        },
        error: (error) => {
          console.error('Error al programar mantenimiento:', error);
          alert('Error al programar mantenimiento');
        }
      });
    }
  }

  esHoyElMantenimiento(fechaProgramada: string): boolean {
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const fechaProgStr = fechaProgramada.split('T')[0];
    return hoyStr === fechaProgStr;
  }

  iniciarMantenimiento(mantenimiento: Mantenimiento): void {
    if (confirm('¿Desea iniciar este mantenimiento ahora?')) {
      const ahora = new Date().toISOString();
      
      mantenimiento.fecha_iniciado = ahora;
      mantenimiento.estado = 'En proceso';

      this.apiService.updateMantenimiento(mantenimiento.id_mantenimiento!, mantenimiento).subscribe({
        next: () => {
          this.actualizarEstadoEquipo(mantenimiento.id_equipo, 'En mantenimiento');
          alert('Mantenimiento iniciado exitosamente');
          this.cargarMantenimientos();
        },
        error: (error) => {
          console.error('Error al iniciar mantenimiento:', error);
          alert('Error al iniciar mantenimiento');
        }
      });
    }
  }

  finalizarMantenimiento(mantenimiento: Mantenimiento): void {
    if (confirm('¿Desea finalizar este mantenimiento?')) {
      const ahora = new Date().toISOString();
      
      mantenimiento.fecha_realizado = ahora;
      mantenimiento.estado = 'Completado';

      this.apiService.updateMantenimiento(mantenimiento.id_mantenimiento!, mantenimiento).subscribe({
        next: () => {
          this.actualizarEstadoEquipo(mantenimiento.id_equipo, 'Operativo');
          alert('Mantenimiento finalizado exitosamente');
          this.cargarMantenimientos();
        },
        error: (error) => {
          console.error('Error al finalizar mantenimiento:', error);
          alert('Error al finalizar mantenimiento');
        }
      });
    }
  }

  verReporte(mantenimiento: Mantenimiento): void {
    console.log('Cargando reporte para mantenimiento:', mantenimiento.id_mantenimiento);
    
    this.apiService.getRefaccionesByMantenimiento(mantenimiento.id_mantenimiento!).subscribe({
      next: (refacciones) => {
        console.log('Refacciones encontradas:', refacciones);
        
        this.refaccionesReporte = refacciones;
        
        // FORZAR A NÚMERO con parseFloat
        const costoTotal = refacciones.reduce((sum, r) => {
          const costo = parseFloat(String(r.costo_total || 0));
          console.log('Sumando costo:', costo);
          return sum + costo;
        }, 0);
        
        console.log('Costo total calculado:', costoTotal);
        
        // Calcular duración
        let duracionDias = 0;
        let duracionHoras = 0;
        
        if (mantenimiento.fecha_iniciado && mantenimiento.fecha_realizado) {
          const inicio = new Date(mantenimiento.fecha_iniciado);
          const fin = new Date(mantenimiento.fecha_realizado);
          const diffMs = fin.getTime() - inicio.getTime();
          duracionHoras = Math.floor(diffMs / (1000 * 60 * 60));
          duracionDias = Math.floor(duracionHoras / 24);
          duracionHoras = duracionHoras % 24;
        }

        this.reporteActual = {
          mantenimiento: mantenimiento,
          refacciones: this.refaccionesReporte,
          costoTotal: costoTotal,
          duracionDias: duracionDias,
          duracionHoras: duracionHoras
        };
        
        console.log('Reporte generado:', this.reporteActual);
      },
      error: (error) => {
        console.error('Error al cargar reporte:', error);
        alert('Error al cargar reporte');
      }
    });
  }

  cerrarReporte(): void {
    this.reporteActual = null;
    this.refaccionesReporte = [];
  }

  imprimirReporte(): void {
    window.print();
  }

  actualizarEstadoEquipo(idEquipo: number, nuevoEstado: string): void {
    this.apiService.getEquipos().subscribe({
      next: (equipos) => {
        const equipo = equipos.find(e => e.id_equipo === idEquipo);
        if (equipo) {
          equipo.estado = nuevoEstado;
          this.apiService.updateEquipo(idEquipo, equipo).subscribe({
            next: () => {
              console.log('Estado del equipo actualizado');
            },
            error: (error) => {
              console.error('Error al actualizar estado del equipo:', error);
            }
          });
        }
      }
    });
  }

  guardarRefaccion(): void {
    if (!this.refaccionNueva.folio_compra || this.refaccionNueva.folio_compra.trim() === '') {
      alert('El folio de compra es obligatorio');
      return;
    }
    if (!this.refaccionNueva.descripcion || this.refaccionNueva.descripcion.trim() === '') {
      alert('La descripción es obligatoria');
      return;
    }
    if (!this.refaccionNueva.cantidad || this.refaccionNueva.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    if (!this.refaccionNueva.costo_unitario || this.refaccionNueva.costo_unitario <= 0) {
      alert('El costo unitario debe ser mayor a 0');
      return;
    }

    this.refaccionNueva.id_mantenimiento = this.mantenimientoParaRefaccion;

    this.apiService.createRefaccion(this.refaccionNueva).subscribe({
      next: () => {
        alert('Refacción registrada exitosamente');
        this.cargarRefacciones(this.mantenimientoParaRefaccion);
        this.refaccionNueva = this.nuevaRefaccion();
      },
      error: (error) => {
        console.error('Error al registrar refacción:', error);
        alert('Error al registrar refacción');
      }
    });
  }

  eliminarMantenimiento(id: number): void {
    if (confirm('¿Está seguro de eliminar este mantenimiento?')) {
      this.apiService.deleteMantenimiento(id).subscribe({
        next: () => {
          alert('Mantenimiento eliminado exitosamente');
          this.cargarMantenimientos();
        },
        error: (error) => {
          console.error('Error al eliminar mantenimiento:', error);
          alert('Error al eliminar mantenimiento');
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

  calcularTotalRefacciones(): number {
    return this.refacciones.reduce((sum, r) => {
      const costo = parseFloat(String(r.costo_total || 0));
      return sum + costo;
    }, 0);
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