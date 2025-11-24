import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Area, Tipo, Equipo, Mantenimiento, Refaccion } from '../../models/interfaces';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.css'
})
export class MantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  areas: Area[] = [];
  tipos: Tipo[] = [];
  equipos: Equipo[] = [];
  
  mostrarModal = false;
  mostrarModalRefacciones = false;
  mostrarModalObservaciones = false;
  mostrarModalCambiarEstado = false;
  modoEdicion = false;
  mantenimientoActual: Mantenimiento = this.getMantenimientoVacio();
  mantenimientoParaRefacciones: Mantenimiento | null = null;
  mantenimientoParaObservaciones: Mantenimiento | null = null;
  mantenimientoParaCambiarEstado: Mantenimiento | null = null;

  // Refacciones
  refacciones: Refaccion[] = [];
  nuevaRefaccion: Refaccion = this.getRefaccionVacia();

  // 👇 NUEVAS PROPIEDADES PARA PROVEEDORES
  proveedoresDisponibles: string[] = [];
  proveedorSeleccionado: string = '';
  mostrarInputProveedor: boolean = false;

  // Observaciones temporales
  observacionesTemp: string = '';
  descripcionTemp: string = '';
  nuevoEstado: string = '';

  // Lista de empleados disponibles
  empleadosDisponibles = [
    'Empleado 1',
    'Empleado 2',
    'Empleado 3',
    'Empleado 4',
    'Empleado 5'
  ];

  // Para el rol del usuario
  isAdmin: boolean = false;
  currentUsername: string = '';
  
  // 👇 NUEVA PROPIEDAD PARA MODO EDITOR
  modoEditorActivo: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    const user = this.authService.currentUserValue;
    this.isAdmin = user?.rol === 'admin';
    this.currentUsername = user?.nombre || '';
    
    // 👇 VERIFICAR MODO EDITOR
    this.modoEditorActivo = localStorage.getItem('modoEditor') === 'true';
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarProveedores(); 
  }

  cargarDatos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        if (!this.isAdmin) {
          this.mantenimientos = data.filter(m => m.responsable === this.currentUsername);
        } else {
          this.mantenimientos = data;
        }
      },
      error: (error) => console.error('Error al cargar mantenimientos:', error)
    });

    this.apiService.getAreas().subscribe({
      next: (data) => this.areas = data,
      error: (error) => console.error('Error al cargar áreas:', error)
    });

    this.apiService.getTipos().subscribe({
      next: (data) => this.tipos = data,
      error: (error) => console.error('Error al cargar tipos:', error)
    });

    this.apiService.getEquipos().subscribe({
      next: (data) => this.equipos = data,
      error: (error) => console.error('Error al cargar equipos:', error)
    });
  }

  // 👇 NUEVO MÉTODO
  cargarProveedores(): void {
    this.apiService.getProveedores().subscribe({
      next: (data) => {
        this.proveedoresDisponibles = data;
      },
      error: (error) => console.error('Error al cargar proveedores:', error)
    });
  }

  getMantenimientoVacio(): Mantenimiento {
    return {
      id_equipo: 0,
      fecha_programada: '',
      tipo_mantenimiento: 'Preventivo',
      descripcion: '',
      responsable: '',
      estado: 'Programado',
      observaciones: ''
    };
  }

  getRefaccionVacia(): Refaccion {
    return {
      id_mantenimiento: 0,
      nombre_refaccion: '',
      cantidad: 1,
      costo_unitario: 0,
      proveedor: ''
    };
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.mantenimientoActual = this.getMantenimientoVacio();
  }

  editarMantenimiento(mantenimiento: Mantenimiento): void {
    this.mostrarModal = true;
    this.modoEdicion = true;
    this.mantenimientoActual = { ...mantenimiento };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mantenimientoActual = this.getMantenimientoVacio();
  }

  guardarMantenimiento(): void {
    if (!this.mantenimientoActual.id_equipo || this.mantenimientoActual.id_equipo === 0) {
      alert('Por favor selecciona un equipo');
      return;
    }

    if (!this.mantenimientoActual.fecha_programada) {
      alert('Por favor selecciona una fecha');
      return;
    }

    if (!this.mantenimientoActual.responsable) {
      alert('Por favor selecciona un responsable');
      return;
    }

    if (this.modoEdicion && this.mantenimientoActual.id_mantenimiento) {
      this.apiService.updateMantenimiento(
        this.mantenimientoActual.id_mantenimiento,
        this.mantenimientoActual
      ).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModal();
          alert('Mantenimiento actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          alert('Error al actualizar el mantenimiento');
        }
      });
    } else {
      this.apiService.createMantenimiento(this.mantenimientoActual).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModal();
          alert('Mantenimiento creado correctamente');
        },
        error: (error) => {
          console.error('Error al crear:', error);
          alert('Error al crear el mantenimiento');
        }
      });
    }
  }

  eliminarMantenimiento(id: number): void {
    if (confirm('¿Estás seguro de eliminar este mantenimiento?')) {
      this.apiService.deleteMantenimiento(id).subscribe({
        next: () => {
          this.cargarDatos();
          alert('Mantenimiento eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el mantenimiento');
        }
      });
    }
  }

  abrirModalCambiarEstado(mantenimiento: Mantenimiento): void {
    this.mantenimientoParaCambiarEstado = mantenimiento;
    this.nuevoEstado = mantenimiento.estado || 'Programado';
    this.mostrarModalCambiarEstado = true;
  }

  cerrarModalCambiarEstado(): void {
    this.mostrarModalCambiarEstado = false;
    this.mantenimientoParaCambiarEstado = null;
    this.nuevoEstado = '';
  }

  guardarCambioEstado(): void {
    if (!this.mantenimientoParaCambiarEstado) return;

    const mantenimientoActualizado: Mantenimiento = {
      ...this.mantenimientoParaCambiarEstado,
      estado: this.nuevoEstado as any
    };

    this.apiService.updateMantenimiento(
      this.mantenimientoParaCambiarEstado.id_mantenimiento!,
      mantenimientoActualizado
    ).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModalCambiarEstado();
        alert('Estado actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado');
      }
    });
  }

  abrirModalObservaciones(mantenimiento: Mantenimiento): void {
    this.mantenimientoParaObservaciones = mantenimiento;
    this.descripcionTemp = mantenimiento.descripcion || '';
    this.observacionesTemp = mantenimiento.observaciones || '';
    this.mostrarModalObservaciones = true;
  }

  cerrarModalObservaciones(): void {
    this.mostrarModalObservaciones = false;
    this.mantenimientoParaObservaciones = null;
    this.descripcionTemp = '';
    this.observacionesTemp = '';
  }

  guardarObservaciones(): void {
    if (!this.mantenimientoParaObservaciones) return;

    const mantenimientoActualizado: Mantenimiento = {
      ...this.mantenimientoParaObservaciones,
      descripcion: this.descripcionTemp,
      observaciones: this.observacionesTemp
    };

    this.apiService.updateMantenimiento(
      this.mantenimientoParaObservaciones.id_mantenimiento!,
      mantenimientoActualizado
    ).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModalObservaciones();
        alert('Observaciones guardadas correctamente');
      },
      error: (error) => {
        console.error('Error al guardar observaciones:', error);
        alert('Error al guardar las observaciones');
      }
    });
  }

  iniciarMantenimiento(mantenimiento: Mantenimiento): void {
    if (confirm('¿Deseas iniciar este mantenimiento?')) {
      const mantenimientoActualizado: Mantenimiento = {
        ...mantenimiento,
        estado: 'En Proceso',
        fecha_inicio: new Date().toISOString()
      };

      this.apiService.updateMantenimiento(
        mantenimiento.id_mantenimiento!,
        mantenimientoActualizado
      ).subscribe({
        next: () => {
          this.cargarDatos();
          alert('Mantenimiento iniciado correctamente');
        },
        error: (error) => {
          console.error('Error al iniciar mantenimiento:', error);
          alert('Error al iniciar el mantenimiento');
        }
      });
    }
  }

  finalizarMantenimiento(mantenimiento: Mantenimiento): void {
    if (confirm('¿Deseas finalizar este mantenimiento?')) {
      const mantenimientoActualizado: Mantenimiento = {
        ...mantenimiento,
        estado: 'Completado',
        fecha_finalizacion: new Date().toISOString()
      };

      this.apiService.updateMantenimiento(
        mantenimiento.id_mantenimiento!,
        mantenimientoActualizado
      ).subscribe({
        next: () => {
          this.cargarDatos();
          alert('Mantenimiento finalizado correctamente');
        },
        error: (error) => {
          console.error('Error al finalizar mantenimiento:', error);
          alert('Error al finalizar el mantenimiento');
        }
      });
    }
  }

  // 👇 MODIFICADO: Cargar proveedores al abrir modal
  abrirModalRefacciones(mantenimiento: Mantenimiento): void {
    this.mantenimientoParaRefacciones = mantenimiento;
    this.mostrarModalRefacciones = true;
    this.cargarRefacciones(mantenimiento.id_mantenimiento!);
    this.cargarProveedores(); 
  }

  cerrarModalRefacciones(): void {
    this.mostrarModalRefacciones = false;
    this.mantenimientoParaRefacciones = null;
    this.refacciones = [];
    this.nuevaRefaccion = this.getRefaccionVacia();
    this.proveedorSeleccionado = ''; 
    this.mostrarInputProveedor = false; 
  }

  cargarRefacciones(idMantenimiento: number): void {
    this.apiService.getRefaccionesByMantenimiento(idMantenimiento).subscribe({
      next: (data) => {
        this.refacciones = data;
      },
      error: (error) => console.error('Error al cargar refacciones:', error)
    });
  }

  // 👇 MODIFICADO: Agregar lógica de proveedores
  agregarRefaccion(): void {
    if (!this.nuevaRefaccion.nombre_refaccion) {
      alert('Por favor ingresa el nombre de la refacción');
      return;
    }

    if (this.nuevaRefaccion.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    // 👇 NUEVA LÓGICA DE PROVEEDORES
    if (this.proveedorSeleccionado === 'nuevo') {
      // El usuario escribió un nuevo proveedor en el input
    } else if (this.proveedorSeleccionado && this.proveedorSeleccionado !== '') {
      this.nuevaRefaccion.proveedor = this.proveedorSeleccionado;
    }

    this.nuevaRefaccion.id_mantenimiento = this.mantenimientoParaRefacciones!.id_mantenimiento!;

    this.apiService.createRefaccion(this.nuevaRefaccion).subscribe({
      next: () => {
        this.cargarRefacciones(this.mantenimientoParaRefacciones!.id_mantenimiento!);
        this.cargarProveedores(); 
        this.nuevaRefaccion = this.getRefaccionVacia();
        this.proveedorSeleccionado = '';
        this.mostrarInputProveedor = false;
        alert('Refacción agregada correctamente');
      },
      error: (error) => {
        console.error('Error al agregar refacción:', error);
        alert('Error al agregar la refacción');
      }
    });
  }

  // 👇 NUEVO MÉTODO
  onProveedorChange(): void {
    if (this.proveedorSeleccionado === 'nuevo') {
      this.mostrarInputProveedor = true;
      this.nuevaRefaccion.proveedor = '';
    } else {
      this.mostrarInputProveedor = false;
      this.nuevaRefaccion.proveedor = this.proveedorSeleccionado;
    }
  }

  puedeIniciar(mantenimiento: Mantenimiento): boolean {
    return mantenimiento.estado === 'Programado';
  }

  puedeFinalizarOAgregarRefacciones(mantenimiento: Mantenimiento): boolean {
    return mantenimiento.estado === 'En Proceso';
  }

  esMiMantenimiento(mantenimiento: Mantenimiento): boolean {
    return mantenimiento.responsable === this.currentUsername;
  }

  // 👇 NUEVO MÉTODO PARA MODO EDITOR
  puedeEditarConModoEditor(mantenimiento: Mantenimiento): boolean {
    return this.modoEditorActivo && this.isAdmin && 
           (mantenimiento.estado === 'Completado' || mantenimiento.estado === 'Cancelado');
  }

  getEquipoNombre(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    if (equipo?.marca && equipo?.modelo) {
      return `${equipo.marca} ${equipo.modelo}`;
    }
    return equipo?.numero_serie || 'N/A';
  }

  getEquipoArea(idEquipo: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === idEquipo);
    return equipo?.nombre_area || 'N/A';
  }

  getEquipoTipo(idEquipo: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === idEquipo);
    return equipo?.nombre_tipo || 'N/A';
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

  getTipoClass(tipo: string | undefined): string {
    if (!tipo) return 'bg-secondary';
    
    const classes: { [key: string]: string } = {
      'Preventivo': 'bg-primary',
      'Correctivo': 'bg-warning',
      'Inspección': 'bg-info'
    };
    return classes[tipo] || 'bg-secondary';
  }

// 👇 NUEVO MÉTODO: Reabrir mantenimiento (cambiar a Programado)
  reabrirMantenimiento(mantenimiento: Mantenimiento): void {
    if (confirm('¿Deseas reabrir este mantenimiento y cambiar su estado a Programado?')) {
      const mantenimientoActualizado: Mantenimiento = {
        ...mantenimiento,
        estado: 'Programado',
        fecha_inicio: undefined,
        fecha_finalizacion: undefined
      };

      this.apiService.updateMantenimiento(
        mantenimiento.id_mantenimiento!,
        mantenimientoActualizado
      ).subscribe({
        next: () => {
          this.cargarDatos();
          alert('✅ Mantenimiento reabierto correctamente.\nAhora está en estado: Programado');
        },
        error: (error) => {
          console.error('Error al reabrir mantenimiento:', error);
          alert('❌ Error al reabrir el mantenimiento');
        }
      });
    }
  }


  // ... tus métodos existentes ...
// 👇 MÉTODO CORREGIDO: Generar Orden de Trabajo
  generarOrdenTrabajo(mantenimiento: Mantenimiento): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('ORDEN DE TRABAJO', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Sistema de Mantenimiento Hotel HB', 105, 25, { align: 'center' });
    
    // Información general
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de emision: ${new Date().toLocaleDateString('es-MX')}`, 14, 45);
    doc.text(`No. Orden: MT-${mantenimiento.id_mantenimiento || '000'}`, 150, 45);
    
    // Cuadro de información del equipo
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 55, 182, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACION DEL EQUIPO', 16, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPos = 70;
    
    doc.text(`Equipo: ${this.getEquipoNombre(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 7;
    doc.text(`Area: ${this.getEquipoArea(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 7;
    doc.text(`Tipo: ${this.getEquipoTipo(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 7;
    
    const equipo = this.equipos.find(e => e.id_equipo === mantenimiento.id_equipo);
    if (equipo?.numero_serie) {
      doc.text(`Numero de Serie: ${equipo.numero_serie}`, 16, yPos);
      yPos += 7;
    }
    
    // Cuadro de información del mantenimiento
    yPos += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORMACION DEL MANTENIMIENTO', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Tipo de Mantenimiento: ${mantenimiento.tipo_mantenimiento}`, 16, yPos);
    yPos += 7;
    doc.text(`Fecha Programada: ${new Date(mantenimiento.fecha_programada).toLocaleDateString('es-MX')}`, 16, yPos);
    yPos += 7;
    doc.text(`Responsable: ${mantenimiento.responsable}`, 16, yPos);
    yPos += 7;
    doc.text(`Estado: ${mantenimiento.estado}`, 16, yPos);
    yPos += 10;
    
    // Descripción del trabajo
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DESCRIPCION DEL TRABAJO', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (mantenimiento.descripcion) {
      const descripcionLines = doc.splitTextToSize(mantenimiento.descripcion, 175);
      doc.text(descripcionLines, 16, yPos);
      yPos += (descripcionLines.length * 7);
    } else {
      doc.rect(16, yPos, 175, 30);
      yPos += 35;
    }
    
    // Observaciones
    yPos += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('OBSERVACIONES', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (mantenimiento.observaciones) {
      const observacionesLines = doc.splitTextToSize(mantenimiento.observaciones, 175);
      doc.text(observacionesLines, 16, yPos);
      yPos += (observacionesLines.length * 7) + 5;
    } else {
      doc.rect(16, yPos, 175, 20);
      yPos += 25;
    }
    
    // Firmas
    yPos += 10;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    const firmaY = yPos;
    
    // Firma del responsable
    doc.line(20, firmaY, 80, firmaY);
    doc.setFontSize(9);
    doc.text('Firma del Responsable', 50, firmaY + 5, { align: 'center' });
    doc.text(mantenimiento.responsable, 50, firmaY + 10, { align: 'center' });
    
    // Firma de supervisión
    doc.line(130, firmaY, 190, firmaY);
    doc.text('Firma de Supervision', 160, firmaY + 5, { align: 'center' });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Hotel HB - Sistema de Mantenimiento', 105, 285, { align: 'center' });
    
    // Guardar PDF
    doc.save(`orden_trabajo_${mantenimiento.id_mantenimiento || 'nueva'}_${new Date().getTime()}.pdf`);
  }

  // 👇 MÉTODO CORREGIDO: Generar Reporte Individual
  generarReporteMantenimiento(mantenimiento: Mantenimiento): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(25, 135, 84);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('REPORTE DE MANTENIMIENTO', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Sistema de Mantenimiento Hotel HB', 105, 25, { align: 'center' });
    
    // Información general
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString('es-MX')}`, 14, 45);
    doc.text(`No. Mantenimiento: MT-${mantenimiento.id_mantenimiento || '000'}`, 140, 45);
    
    // Estado
    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado: ${mantenimiento.estado}`, 14, yPos);
    
    // Información del equipo
    yPos += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFontSize(12);
    doc.text('EQUIPO INTERVENIDO', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Equipo: ${this.getEquipoNombre(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 7;
    doc.text(`Area: ${this.getEquipoArea(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 7;
    doc.text(`Tipo: ${this.getEquipoTipo(mantenimiento.id_equipo)}`, 16, yPos);
    yPos += 10;
    
    // Fechas del mantenimiento
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CRONOLOGIA', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Fecha Programada: ${new Date(mantenimiento.fecha_programada).toLocaleDateString('es-MX')}`, 16, yPos);
    yPos += 7;
    
    if (mantenimiento.fecha_inicio) {
      doc.text(`Fecha de Inicio: ${new Date(mantenimiento.fecha_inicio).toLocaleString('es-MX')}`, 16, yPos);
      yPos += 7;
    }
    
    if (mantenimiento.fecha_finalizacion) {
      doc.text(`Fecha de Finalizacion: ${new Date(mantenimiento.fecha_finalizacion).toLocaleString('es-MX')}`, 16, yPos);
      yPos += 7;
      
      const duracion = this.calcularDuracion(mantenimiento.fecha_inicio, mantenimiento.fecha_finalizacion);
      doc.text(`Duracion Total: ${duracion.toFixed(2)} horas`, 16, yPos);
      yPos += 7;
    }
    
    doc.text(`Responsable: ${mantenimiento.responsable}`, 16, yPos);
    yPos += 10;
    
    // Trabajo realizado
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TRABAJO REALIZADO', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (mantenimiento.descripcion) {
      const descripcionLines = doc.splitTextToSize(mantenimiento.descripcion, 175);
      doc.text(descripcionLines, 16, yPos);
      yPos += (descripcionLines.length * 7) + 5;
    } else {
      doc.text('Sin descripcion registrada', 16, yPos);
      yPos += 10;
    }
    
    // Observaciones
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('OBSERVACIONES Y RECOMENDACIONES', 16, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (mantenimiento.observaciones) {
      const observacionesLines = doc.splitTextToSize(mantenimiento.observaciones, 175);
      doc.text(observacionesLines, 16, yPos);
      yPos += (observacionesLines.length * 7) + 5;
    } else {
      doc.text('Sin observaciones', 16, yPos);
      yPos += 10;
    }
    
    // Refacciones utilizadas
    yPos += 5;
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('REFACCIONES UTILIZADAS', 16, yPos + 5);
    
    yPos += 13;
    
    this.apiService.getRefaccionesByMantenimiento(mantenimiento.id_mantenimiento!).subscribe({
      next: (refacciones) => {
        if (refacciones.length > 0) {
          const tableData = refacciones.map(r => [
            r.nombre_refaccion,
            r.cantidad.toString(),
            `$${(r.costo_unitario || 0).toFixed(2)}`,
            `$${((r.costo_unitario || 0) * r.cantidad).toFixed(2)}`,
            r.proveedor || '-'
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Refaccion', 'Cant.', 'Costo Unit.', 'Subtotal', 'Proveedor']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [25, 135, 84] }
          });
          
          const totalRefacciones = refacciones.reduce((sum, r) => sum + ((r.costo_unitario || 0) * r.cantidad), 0);
          
          const finalY = (doc as any).lastAutoTable.finalY + 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`COSTO TOTAL EN REFACCIONES: $${totalRefacciones.toFixed(2)}`, 14, finalY);
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(128, 128, 128);
          doc.text('Hotel HB - Sistema de Mantenimiento', 105, 285, { align: 'center' });
          
          doc.save(`reporte_mantenimiento_${mantenimiento.id_mantenimiento}_${new Date().getTime()}.pdf`);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text('No se utilizaron refacciones', 16, yPos);
          
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text('Hotel HB - Sistema de Mantenimiento', 105, 285, { align: 'center' });
          
          doc.save(`reporte_mantenimiento_${mantenimiento.id_mantenimiento}_${new Date().getTime()}.pdf`);
        }
      },
      error: () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Error al cargar refacciones', 16, yPos);
        
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Hotel HB - Sistema de Mantenimiento', 105, 285, { align: 'center' });
        
        doc.save(`reporte_mantenimiento_${mantenimiento.id_mantenimiento}_${new Date().getTime()}.pdf`);
      }
    });
  }

  calcularDuracion(fechaInicio: string | undefined, fechaFin: string | undefined): number {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio).getTime();
    const fin = new Date(fechaFin).getTime();
    return (fin - inicio) / (1000 * 60 * 60);
  }

  // 👇 ESTE MÉTODO SOLO DEBE APARECER UNA VEZ
  getTotalRefacciones(): number {
    return this.refacciones.reduce((sum, ref) => {
      return sum + ((ref.costo_unitario || 0) * ref.cantidad);
    }, 0);
  }

}