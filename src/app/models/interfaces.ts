export interface Area {
  id_area?: number;
  nombre_area: string;
  descripcion?: string;
}

export interface Tipo {
  id_tipo?: number;
  nombre_tipo?: string;
  descripcion?: string;
}

export interface Equipo {
  id_equipo?: number;
  numero_serie?: string;
  marca?: string;
  modelo?: string;
  id_area: number;
  id_tipo: number;
  fecha_adquisicion?: string;
  estado?: 'Operativo' | 'Fuera de Servicio' | 'En Mantenimiento' | 'Dado de Baja';
  ubicacion_especifica?: string;
  costo_adquisicion?: number;
  vida_util_anos?: number;
  observaciones?: string;
  nombre_area?: string;
  nombre_tipo?: string;
}

export interface Mantenimiento {
  id_mantenimiento?: number;
  id_equipo: number;
  fecha_programada: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  tipo_mantenimiento: 'Preventivo' | 'Correctivo' | 'Inspección';
  descripcion?: string;
  responsable: string;
  estado: 'Programado' | 'En Proceso' | 'Completado' | 'Cancelado';
  observaciones?: string;
  costo?: number;
}

export interface Refaccion {
  id_refaccion?: number;
  id_mantenimiento: number;
  nombre_refaccion: string;
  cantidad: number;
  costo_unitario?: number;
  proveedor?: string;
}

export interface Estadisticas {
  totalEquipos: number;
  equiposOperativos: number;
  equiposFueraServicio: number;
  mantenimientosProgramados: number;
  mantenimientosPendientes: number;
  mantenimientosRealizados: number;
  costoTotal: number;
}

// 👇 NUEVAS INTERFACES PARA TICKETS Y HORARIOS

export interface Ticket {
  id_ticket?: string;
  area: string;
  piso: string;
  habitacion: string;
  descripcion_problema: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  creado_por: string;
  asignado_a: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  fecha_creacion: string;
  fecha_limite: string;
  observaciones_mantenimiento?: string;
  fecha_completado?: string;
}

export interface Horario {
  id_horario?: string;
  username: string;
  fecha: string;
  disponible: boolean;
  motivo?: string;
  created_at?: string;
}

export interface User {
  username: string;
  nombre: string;
  rol: 'admin' | 'mantenimiento' | 'amadellaves';
  area?: string;
}