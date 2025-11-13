import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Mantenimiento, Equipo, Area, Tipo } from '../../models/interfaces';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  tipoFecha: 'hoy' | 'semana' | 'mes' | 'anio' | 'personalizado';
  semanaSeleccionada: number;
  mesSeleccionado: number;
  idArea: number;
  idTipo: number;
  estado: string;
  tipoMantenimiento: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  mantenimientosFiltrados: Mantenimiento[] = [];
  equipos: Equipo[] = [];
  areas: Area[] = [];
  tipos: Tipo[] = [];

  mostrarModalReporte = false;

  filtros: FiltrosReporte = {
    fechaInicio: '',
    fechaFin: '',
    tipoFecha: 'mes',
    semanaSeleccionada: 1,
    mesSeleccionado: new Date().getMonth() + 1,
    idArea: 0,
    idTipo: 0,
    estado: '',
    tipoMantenimiento: ''
  };

  // Opciones de semanas
  semanasDelMes = [
    { numero: 1, rango: 'Semana 1 (1-7)' },
    { numero: 2, rango: 'Semana 2 (8-14)' },
    { numero: 3, rango: 'Semana 3 (15-21)' },
    { numero: 4, rango: 'Semana 4 (22-28)' },
    { numero: 5, rango: 'Semana 5 (29-31)' }
  ];

  mesesDelAnio = [
    { numero: 1, nombre: 'Enero' },
    { numero: 2, nombre: 'Febrero' },
    { numero: 3, nombre: 'Marzo' },
    { numero: 4, nombre: 'Abril' },
    { numero: 5, nombre: 'Mayo' },
    { numero: 6, nombre: 'Junio' },
    { numero: 7, nombre: 'Julio' },
    { numero: 8, nombre: 'Agosto' },
    { numero: 9, nombre: 'Septiembre' },
    { numero: 10, nombre: 'Octubre' },
    { numero: 11, nombre: 'Noviembre' },
    { numero: 12, nombre: 'Diciembre' }
  ];

  // Estadísticas del reporte
  estadisticas = {
    total: 0,
    completados: 0,
    enProceso: 0,
    cancelados: 0,
    costoTotal: 0,
    tiempoPromedio: 0
  };

  isAdmin: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    const user = this.authService.currentUserValue;
    this.isAdmin = user?.rol === 'admin';
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
      },
      error: (error) => console.error('Error:', error)
    });

    this.apiService.getEquipos().subscribe({
      next: (data) => this.equipos = data,
      error: (error) => console.error('Error:', error)
    });

    this.apiService.getAreas().subscribe({
      next: (data) => this.areas = data,
      error: (error) => console.error('Error:', error)
    });

    this.apiService.getTipos().subscribe({
      next: (data) => this.tipos = data,
      error: (error) => console.error('Error:', error)
    });
  }

  abrirModalReporte(): void {
    this.mostrarModalReporte = true;
    this.establecerFechasPorTipo();
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
  }

  onTipoFechaChange(): void {
    this.establecerFechasPorTipo();
  }

  establecerFechasPorTipo(): void {
    const hoy = new Date();
    let inicio: Date;
    let fin: Date = hoy;

    switch (this.filtros.tipoFecha) {
      case 'hoy':
        inicio = new Date(hoy);
        fin = new Date(hoy);
        break;
      
      case 'semana':
        const mesActual = this.filtros.mesSeleccionado || hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();
        const diaInicio = ((this.filtros.semanaSeleccionada - 1) * 7) + 1;
        const diaFin = Math.min(diaInicio + 6, new Date(anioActual, mesActual, 0).getDate());
        
        inicio = new Date(anioActual, mesActual - 1, diaInicio);
        fin = new Date(anioActual, mesActual - 1, diaFin);
        break;
      
      case 'mes':
        const mes = this.filtros.mesSeleccionado || hoy.getMonth() + 1;
        const anio = hoy.getFullYear();
        inicio = new Date(anio, mes - 1, 1);
        fin = new Date(anio, mes, 0);
        break;
      
      case 'anio':
        inicio = new Date(hoy.getFullYear(), 0, 1);
        fin = new Date(hoy.getFullYear(), 11, 31);
        break;
      
      case 'personalizado':
        return;
    }

    this.filtros.fechaInicio = inicio.toISOString().split('T')[0];
    this.filtros.fechaFin = fin.toISOString().split('T')[0];
  }

  generarReporte(): void {
    this.aplicarFiltros();
    this.cerrarModalReporte();
  }

  aplicarFiltros(): void {
    this.mantenimientosFiltrados = this.mantenimientos.filter(m => {
      if (this.filtros.fechaInicio && this.filtros.fechaFin) {
        const fechaMant = new Date(m.fecha_programada);
        const fechaInicio = new Date(this.filtros.fechaInicio);
        const fechaFin = new Date(this.filtros.fechaFin);
        if (fechaMant < fechaInicio || fechaMant > fechaFin) return false;
      }

      if (this.filtros.idArea !== 0) {
        const equipo = this.equipos.find(e => e.id_equipo === m.id_equipo);
        if (!equipo || equipo.id_area !== this.filtros.idArea) return false;
      }

      if (this.filtros.idTipo !== 0) {
        const equipo = this.equipos.find(e => e.id_equipo === m.id_equipo);
        if (!equipo || equipo.id_tipo !== this.filtros.idTipo) return false;
      }

      if (this.filtros.estado && m.estado !== this.filtros.estado) return false;

      if (this.filtros.tipoMantenimiento && m.tipo_mantenimiento !== this.filtros.tipoMantenimiento) return false;

      return true;
    });

    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.mantenimientosFiltrados.length;
    this.estadisticas.completados = this.mantenimientosFiltrados.filter(m => m.estado === 'Completado').length;
    this.estadisticas.enProceso = this.mantenimientosFiltrados.filter(m => m.estado === 'En Proceso').length;
    this.estadisticas.cancelados = this.mantenimientosFiltrados.filter(m => m.estado === 'Cancelado').length;
    
    this.estadisticas.costoTotal = this.mantenimientosFiltrados.reduce((sum, m) => sum + (m.costo || 0), 0);

    const completados = this.mantenimientosFiltrados.filter(m => 
      m.estado === 'Completado' && m.fecha_inicio && m.fecha_finalizacion
    );

    if (completados.length > 0) {
      const tiempoTotal = completados.reduce((sum, m) => {
        const inicio = new Date(m.fecha_inicio!).getTime();
        const fin = new Date(m.fecha_finalizacion!).getTime();
        return sum + (fin - inicio);
      }, 0);

      this.estadisticas.tiempoPromedio = tiempoTotal / completados.length / (1000 * 60 * 60);
    } else {
      this.estadisticas.tiempoPromedio = 0;
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      tipoFecha: 'mes',
      semanaSeleccionada: 1,
      mesSeleccionado: new Date().getMonth() + 1,
      idArea: 0,
      idTipo: 0,
      estado: '',
      tipoMantenimiento: ''
    };
    this.mantenimientosFiltrados = [];
    this.estadisticas = {
      total: 0,
      completados: 0,
      enProceso: 0,
      cancelados: 0,
      costoTotal: 0,
      tiempoPromedio: 0
    };
  }

  generarPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Mantenimientos', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 28);
    doc.text(`Periodo: ${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`, 14, 34);
    
    doc.setFontSize(12);
    doc.text('Resumen Estadistico', 14, 44);
    doc.setFontSize(10);
    doc.text(`Total: ${this.estadisticas.total}`, 14, 52);
    doc.text(`Completados: ${this.estadisticas.completados}`, 14, 58);
    doc.text(`En Proceso: ${this.estadisticas.enProceso}`, 70, 58);
    doc.text(`Costo Total: $${this.estadisticas.costoTotal.toFixed(2)}`, 14, 64);
    
    const tableData = this.mantenimientosFiltrados.map(m => [
      this.getEquipoNombre(m.id_equipo),
      this.getEquipoArea(m.id_equipo),
      new Date(m.fecha_programada).toLocaleDateString('es-MX'),
      m.responsable,
      m.tipo_mantenimiento,
      m.estado,
      `$${(m.costo || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['Equipo', 'Area', 'Fecha', 'Responsable', 'Tipo', 'Estado', 'Costo']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] }
    });

    doc.save(`reporte_mantenimientos_${new Date().getTime()}.pdf`);
  }

  exportarExcel(): void {
    let csv = 'Equipo,Area,Tipo,Fecha,Responsable,Tipo Mantenimiento,Estado,Costo\n';
    
    this.mantenimientosFiltrados.forEach(m => {
      const equipo = this.equipos.find(e => e.id_equipo === m.id_equipo);
      csv += `${this.getEquipoNombre(m.id_equipo)},`;
      csv += `${equipo?.nombre_area || 'N/A'},`;
      csv += `${equipo?.nombre_tipo || 'N/A'},`;
      csv += `${m.fecha_programada},`;
      csv += `${m.responsable},`;
      csv += `${m.tipo_mantenimiento},`;
      csv += `${m.estado},`;
      csv += `${m.costo || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_mantenimientos_${new Date().getTime()}.csv`;
    a.click();
  }

  calcularDuracion(fechaInicio: string | undefined, fechaFin: string | undefined): number {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio).getTime();
    const fin = new Date(fechaFin).getTime();
    const horas = (fin - inicio) / (1000 * 60 * 60);
    
    return horas;
  }

  getEquipoNombre(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    if (equipo?.marca && equipo?.modelo) {
      return `${equipo.marca} ${equipo.modelo}`;
    }
    return equipo?.numero_serie || 'N/A';
  }

  getEquipoArea(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
    return equipo?.nombre_area || 'N/A';
  }

  getEquipoTipo(id: number): string {
    const equipo = this.equipos.find(e => e.id_equipo === id);
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
}