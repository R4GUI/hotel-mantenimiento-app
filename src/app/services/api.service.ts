import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area, Tipo, Equipo, Mantenimiento, Refaccion, Estadisticas } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Areas
  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiUrl}/areas`);
  }

  createArea(area: Area): Observable<Area> {
    return this.http.post<Area>(`${this.apiUrl}/areas`, area);
  }

  updateArea(id: number, area: Area): Observable<any> {
    return this.http.put(`${this.apiUrl}/areas/${id}`, area);
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

  updateTipo(id: number, tipo: Tipo): Observable<any> {
    return this.http.put(`${this.apiUrl}/tipos/${id}`, tipo);
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

  updateEquipo(id: number, equipo: Equipo): Observable<any> {
    return this.http.put(`${this.apiUrl}/equipos/${id}`, equipo);
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

  updateMantenimiento(id: number, mantenimiento: Mantenimiento): Observable<any> {
    return this.http.put(`${this.apiUrl}/mantenimientos/${id}`, mantenimiento);
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

  // Estadísticas
  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.apiUrl}/estadisticas`);
  }
}