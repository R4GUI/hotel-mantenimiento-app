import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" 
         class="toast-container position-fixed top-0 end-0 p-3" 
         style="z-index: 9999;">
      <div class="toast show" 
           role="alert" 
           [ngClass]="{
             'bg-success text-white': toast.type === 'success',
             'bg-danger text-white': toast.type === 'error',
             'bg-warning text-dark': toast.type === 'warning',
             'bg-info text-white': toast.type === 'info'
           }">
        <div class="toast-header" [ngClass]="{
             'bg-success text-white': toast.type === 'success',
             'bg-danger text-white': toast.type === 'error',
             'bg-warning text-dark': toast.type === 'warning',
             'bg-info text-white': toast.type === 'info'
           }">
          <i class="bi me-2" [ngClass]="{
            'bi-check-circle-fill': toast.type === 'success',
            'bi-x-circle-fill': toast.type === 'error',
            'bi-exclamation-triangle-fill': toast.type === 'warning',
            'bi-info-circle-fill': toast.type === 'info'
          }"></i>
          <strong class="me-auto">{{ getTitle() }}</strong>
          <button type="button" 
                  class="btn-close" 
                  [ngClass]="{'btn-close-white': toast.type !== 'warning'}"
                  (click)="close()"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      min-width: 300px;
    }
  `]
})
export class ToastComponent implements OnInit {
  toast: any = null;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
    });
  }

  getTitle(): string {
    switch(this.toast?.type) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Notificación';
    }
  }

  close(): void {
    this.toast = null;
  }
}