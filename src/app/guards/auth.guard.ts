import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Verificar si la ruta requiere rol específico
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && !requiredRoles.includes(currentUser.rol)) {
        // Usuario no tiene el rol necesario
        this.router.navigate(['/dashboard']);
        return false;
      }
      
      // Usuario autenticado y con rol correcto
      return true;
    }

    // No está autenticado, redirigir al login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}