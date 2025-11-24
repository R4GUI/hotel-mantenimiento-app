import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  username: string;
  nombre: string;
  rol: 'admin' | 'mantenimiento' | 'amadellaves';
  area?: string;
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

  public get isMantenimiento(): boolean {
    return this.currentUserValue?.rol === 'mantenimiento';
  }

  public get isAmaDeLlaves(): boolean {
    return this.currentUserValue?.rol === 'amadellaves';
  }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.apiService.login(username, password).subscribe({
        next: (response) => {
          const user: User = {
            username: response.username,
            nombre: response.nombre,
            rol: response.rol,
            area: response.area
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
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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