import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area, Tipo, Equipo, Mantenimiento, Refaccion, Ticket, Horario } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api-mantenimiento-hotel.onrender.com/api';

  constructor(private http: HttpClient) { }

  // Áreas
  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiUrl}/areas`);
  }

  createArea(area: Area): Observable<Area> {
    return this.http.post<Area>(`${this.apiUrl}/areas`, area);
  }

  updateArea(id: number, area: Area): Observable<Area> {
    return this.http.put<Area>(`${this.apiUrl}/areas/${id}`, area);
  }

  deleteArea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/areas/${id}`);
  }

  // Tipos
  getTipos(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(`${this.apiUrl}/tipos`);
  }

  createTipo(tipo: Tipo): Observable<Tipo> {
    return this.http.post<Tipo>(`${this.apiUrl}/tipos`, tipo);
  }

  updateTipo(id: number, tipo: Tipo): Observable<Tipo> {
    return this.http.put<Tipo>(`${this.apiUrl}/tipos/${id}`, tipo);
  }

  deleteTipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tipos/${id}`);
  }

  // Equipos
  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/equipos`);
  }

  createEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(`${this.apiUrl}/equipos`, equipo);
  }

  updateEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/equipos/${id}`, equipo);
  }

  deleteEquipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/equipos/${id}`);
  }

  // Mantenimientos
  getMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/mantenimientos`);
  }

  createMantenimiento(mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(`${this.apiUrl}/mantenimientos`, mantenimiento);
  }

  updateMantenimiento(id: number, mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.apiUrl}/mantenimientos/${id}`, mantenimiento);
  }

  deleteMantenimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mantenimientos/${id}`);
  }

  // Refacciones
  getRefaccionesByMantenimiento(idMantenimiento: number): Observable<Refaccion[]> {
    return this.http.get<Refaccion[]>(`${this.apiUrl}/refacciones/mantenimiento/${idMantenimiento}`);
  }

  createRefaccion(refaccion: Refaccion): Observable<Refaccion> {
    return this.http.post<Refaccion>(`${this.apiUrl}/refacciones`, refaccion);
  }

  deleteRefaccion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/refacciones/${id}`);
  }

  // Proveedores
  getProveedores(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/proveedores`);
  }

  getGastosPorProveedor(fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    let url = `${this.apiUrl}/proveedores/gastos`;
    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    return this.http.get<any[]>(url);
  }

  // Estadísticas
  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  // 👇 AGREGAR ESTOS MÉTODOS DE AUTENTICACIÓN
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password });
  }

  verifySession(username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/verify`, { username });
  }
    // 👇 NUEVOS MÉTODOS PARA TICKETS

  // Tickets
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets`);
  }

  getTicketsByResponsable(username: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/responsable/${username}`);
  }

  getTicketsHoy(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/hoy`);
  }

  getTicketsIncompletos(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/incompletos/reporte`);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets`, ticket);
  }

  updateTicket(id: string, ticket: Partial<Ticket>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tickets/${id}`, ticket);
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tickets/${id}`);
  }

  // Horarios
  getHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/horarios`);
  }

  getHorariosByFecha(fecha: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/horarios/fecha/${fecha}`);
  }

  getHorariosByEmpleado(username: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/horarios/empleado/${username}`);
  }

  createHorario(horario: Horario): Observable<Horario> {
    return this.http.post<Horario>(`${this.apiUrl}/horarios`, horario);
  }

  createHorariosSemana(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/horarios/semana`, data);
  }

  updateHorario(id: string, horario: Partial<Horario>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/horarios/${id}`, horario);
  }

  deleteHorario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/horarios/${id}`);
  }
}