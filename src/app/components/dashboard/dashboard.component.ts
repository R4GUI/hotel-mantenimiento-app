import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Estadisticas, Mantenimiento } from '../../models/interfaces';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';

// REGISTRAR LOS COMPONENTES
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  estadisticas: Estadisticas = {
    totalEquipos: 0,
    equiposOperativos: 0,
    mantenimientosPendientes: 0,
    costoTotal: 0
  };

  mantenimientosProximos: Mantenimiento[] = [];
  
  // Configuración de gráfica de equipos por área
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#0d6efd',
        '#198754',
        '#ffc107',
        '#dc3545',
        '#6610f2',
        '#0dcaf0',
        '#fd7e14',
        '#20c997'
      ]
    }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Configuración de gráfica de barras
  public barChartData: ChartData<'bar'> = {
    labels: ['Preventivo', 'Correctivo', 'Inspección'],
    datasets: [{
      label: 'Cantidad',
      data: [0, 0, 0],
      backgroundColor: ['#0d6efd', '#ffc107', '#0dcaf0']
    }]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    // Cargar en secuencia para asegurar que todo se carga
    this.cargarEstadisticas();
    this.cargarMantenimientosProximos();
    
    // Esperar un poco antes de cargar las gráficas
    setTimeout(() => {
      this.cargarMantenimientosPorArea();
      this.cargarMantenimientosPorTipo();
    }, 500);
  }

  cargarEstadisticas(): void {
    this.apiService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        console.log('Estadísticas cargadas:', data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  cargarMantenimientosProximos(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (data) => {
        console.log('Mantenimientos cargados:', data);
        this.mantenimientosProximos = data
          .filter(m => m.estado === 'Programado' || m.estado === 'En proceso')
          .sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime())
          .slice(0, 5);
        console.log('Próximos mantenimientos:', this.mantenimientosProximos);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos:', error);
      }
    });
  }

  cargarMantenimientosPorArea(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (mantenimientos) => {
        console.log('Cargando gráfica por área. Mantenimientos:', mantenimientos);
        
        if (mantenimientos.length === 0) {
          console.log('No hay mantenimientos para la gráfica');
          return;
        }

        // Agrupar mantenimientos por área
        const areaCount: { [key: string]: number } = {};
        mantenimientos.forEach(m => {
          const area = m.nombre_area || 'Sin área';
          areaCount[area] = (areaCount[area] || 0) + 1;
        });

        console.log('Conteo por área:', areaCount);

        // Actualizar datos de la gráfica
        this.pieChartData = {
          labels: Object.keys(areaCount),
          datasets: [{
            data: Object.values(areaCount),
            backgroundColor: [
              '#0d6efd',
              '#198754',
              '#ffc107',
              '#dc3545',
              '#6610f2',
              '#0dcaf0',
              '#fd7e14',
              '#20c997'
            ]
          }]
        };
        
        console.log('Datos gráfica pie:', this.pieChartData);
        
        // Forzar actualización
        this.cdr.detectChanges();
        
        if (this.chart) {
          this.chart.chart?.update();
        }
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos para gráfica:', error);
      }
    });
  }

  cargarMantenimientosPorTipo(): void {
    this.apiService.getMantenimientos().subscribe({
      next: (mantenimientos) => {
        console.log('Cargando gráfica por tipo. Mantenimientos:', mantenimientos);
        
        const preventivos = mantenimientos.filter(m => m.tipo_mantenimiento === 'Preventivo').length;
        const correctivos = mantenimientos.filter(m => m.tipo_mantenimiento === 'Correctivo').length;
        const inspecciones = mantenimientos.filter(m => m.tipo_mantenimiento === 'Inspección').length;

        console.log('Preventivos:', preventivos, 'Correctivos:', correctivos, 'Inspecciones:', inspecciones);

        this.barChartData = {
          labels: ['Preventivo', 'Correctivo', 'Inspección'],
          datasets: [{
            label: 'Cantidad',
            data: [preventivos, correctivos, inspecciones],
            backgroundColor: ['#0d6efd', '#ffc107', '#0dcaf0']
          }]
        };
        
        console.log('Datos gráfica barras:', this.barChartData);
        
        // Forzar actualización
        this.cdr.detectChanges();
        
        if (this.chart) {
          this.chart.chart?.update();
        }
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos para gráfica:', error);
      }
    });
  }

  getDiasHasta(fecha: string): number {
    const hoy = new Date();
    const fechaMantenimiento = new Date(fecha);
    const diffTime = fechaMantenimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  getUrgenciaClass(dias: number): string {
    if (dias <= 0) return 'text-danger';
    if (dias <= 3) return 'text-warning';
    return 'text-success';
  }

  getUrgenciaIcon(dias: number): string {
    if (dias <= 0) return 'bi-exclamation-circle-fill';
    if (dias <= 3) return 'bi-clock-fill';
    return 'bi-check-circle-fill';
  }

  getPorcentajeOperativos(): number {
    if (this.estadisticas.totalEquipos === 0) return 0;
    return Math.round((this.estadisticas.equiposOperativos / this.estadisticas.totalEquipos) * 100);
  }
}