// export interface Area {
//   id_area?: number;
//   nombre_area: string;
//   descripcion?: string;
// }

// export interface Tipo {
//   id_tipo?: number;
//   nombre_tipo: string;
//   descripcion?: string;
// }

// export interface Equipo {
//   id_equipo?: number;
//   numero_serie: string;
//   id_area: number;
//   id_tipo: number;
//   marca?: string;
//   modelo?: string;
//   fecha_adquisicion?: string;
//   estado?: string;
//   observaciones?: string;
//   nombre_area?: string;
//   nombre_tipo?: string;
// }

// export interface Mantenimiento {
//   id_mantenimiento?: number;
//   id_equipo: number;
//   fecha_programada: string;
//   fecha_iniciado?: string;  // NUEVO
//   fecha_realizado?: string;
//   responsable: string;
//   tipo_mantenimiento?: string;
//   estado?: string;
//   descripcion_trabajo?: string;
//   observaciones?: string;
//   numero_serie?: string;
//   nombre_area?: string;
//   nombre_tipo?: string;
//   marca?: string;
//   modelo?: string;
// }

// export interface Refaccion {
//   id_refaccion?: number;
//   id_mantenimiento: number;
//   folio_compra: string;
//   descripcion: string;
//   cantidad: number;
//   costo_unitario: number;
//   costo_total?: number;
//   proveedor?: string;
//   fecha_compra: string;
// }

// export interface Estadisticas {
//   totalEquipos: number;
//   equiposOperativos: number;
//   mantenimientosPendientes: number;
//   costoTotal: number;
// }

// // NUEVO: Interface para el reporte
// export interface ReporteMantenimiento {
//   mantenimiento: Mantenimiento;
//   refacciones: Refaccion[];
//   costoTotal: number;
//   duracionDias: number;
//   duracionHoras: number;
// }

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
  numero_serie?: string;  // 👈 Este sí existe en tu API
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
  nombre_area?: string;  // 👈 Esto lo devuelve tu API
  nombre_tipo?: string;  // 👈 Esto también
}

export interface Mantenimiento {
  id_mantenimiento?: number;
  id_equipo: number;
  fecha_programada: string;
  fecha_inicio?: string;  // 👈 Agregado
  fecha_finalizacion?: string;
  tipo_mantenimiento: 'Preventivo' | 'Correctivo' | 'Inspección';
  descripcion?: string;  // 👈 Agregado
  responsable: string;
  estado: 'Programado' | 'En Proceso' | 'Completado' | 'Cancelado';
  observaciones?: string;
  costo?: number;  // 👈 Agregado
}

export interface Refaccion {
  id_refaccion?: number;
  id_mantenimiento: number;
  nombre_refaccion: string;
  cantidad: number;
  costo_unitario?: number;
  proveedor?: string;
}

// export interface Estadisticas {
//   totalEquipos: number;
//   equiposOperativos: number;
//   equiposFueraServicio: number;
//   mantenimientosProgramados: number;
//   mantenimientosRealizados: number;
//   costoTotal: number;
// }
export interface Estadisticas {
  totalEquipos: number;
  equiposOperativos: number;
  equiposFueraServicio: number;
  mantenimientosProgramados: number;
  mantenimientosPendientes: number;  // 👈 Agregado
  mantenimientosRealizados: number;
  costoTotal: number;
}