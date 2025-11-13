import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  username: string;
  nombre: string;
  rol: 'admin' | 'empleado';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Recuperar usuario del localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.rol === 'admin';
  }

  public get isEmpleado(): boolean {
    return this.currentUserValue?.rol === 'empleado';
  }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.apiService.login(username, password).subscribe({
        next: (response) => {
          // Guardar usuario en localStorage
          const user: User = {
            username: response.username,
            nombre: response.nombre,
            rol: response.rol
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  verifySession(): Observable<boolean> {
    return new Observable(observer => {
      const user = this.currentUserValue;
      if (!user) {
        observer.next(false);
        observer.complete();
        return;
      }

      this.apiService.verifySession(user.username).subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          this.logout();
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}