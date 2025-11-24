import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { ToastComponent } from './components/toast/toast.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'hotel-mantenimiento-app';
  currentRoute: string = '';
  currentUser: User | null = null;
  isAdmin: boolean = false;
  isMantenimiento: boolean = false;
  isAmaDeLlaves: boolean = false;

  // Modo editor secreto (15 clicks)
  clickCount: number = 0;
  modoEditorActivo: boolean = false;
  private clickTimeout: any;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    // Detectar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Suscribirse a cambios del usuario
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.rol === 'admin';
      this.isMantenimiento = user?.rol === 'mantenimiento';
      this.isAmaDeLlaves = user?.rol === 'amadellaves';
    });
  }

  ngOnInit(): void {
    // Ocultar el loading screen cuando Angular está listo
    this.hideLoadingScreen();

    // Verificar si el modo editor estaba activo
    const modoEditor = localStorage.getItem('modoEditor');
    if (modoEditor === 'true') {
      this.modoEditorActivo = true;
    }
  }

  // Método para ocultar el loading screen con animación
  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Agregar clase fade-out para animación suave
      loadingScreen.classList.add('fade-out');
      
      // Remover completamente del DOM después de la animación
      setTimeout(() => {
        loadingScreen.remove();
      }, 500); // 500ms = duración de la animación
    }
  }

  isLoginPage(): boolean {
    return this.currentRoute === '/login' || this.currentRoute === '/';
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  // Detectar 15 clicks rápidos en el logo
  onLogoClick(): void {
    this.clickCount++;

    // Limpiar timeout anterior
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    // Si llegó a 15 clicks
    if (this.clickCount >= 15) {
      this.activarModoEditor();
      this.clickCount = 0;
      return;
    }

    // Reiniciar contador después de 2 segundos sin clicks
    this.clickTimeout = setTimeout(() => {
      this.clickCount = 0;
    }, 2000);
  }

  activarModoEditor(): void {
    const password = prompt('🔐 Modo Editor - Ingresa la contraseña:');
    
    if (password === 'hbhoteladmin') {
      this.modoEditorActivo = true;
      alert('✅ Modo Editor ACTIVADO\n\nAhora puedes editar y eliminar mantenimientos completados.');
      
      // Guardar en localStorage
      localStorage.setItem('modoEditor', 'true');
    } else if (password !== null) {
      alert('❌ Contraseña incorrecta');
    }
  }

  desactivarModoEditor(): void {
    if (confirm('¿Deseas desactivar el Modo Editor?')) {
      this.modoEditorActivo = false;
      localStorage.removeItem('modoEditor');
      alert('✅ Modo Editor desactivado');
    }
  }
}