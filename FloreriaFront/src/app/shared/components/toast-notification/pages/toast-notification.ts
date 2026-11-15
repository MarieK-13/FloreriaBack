import { Component, inject } from '@angular/core';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'app-toast-notificacion',
  template: `
    @if (toastService.toastActual(); as toast) {
      <div
        class="toast-container"
        [class.toast--error]="toast.tipo === 'error'"
        [class.toast--info]="toast.tipo === 'info'"
        role="status"
        aria-live="polite"
      >
        <div class="toast-icon" aria-hidden="true">
          @if (toast.tipo === 'error') {
            ✕
          } @else if (toast.tipo === 'info') {
            ♥
          } @else {
            ✓
          }
        </div>

        <div class="toast-content">
          <strong>{{ toast.titulo }}</strong>
          @if (toast.detalle) {
            <span>{{ toast.detalle }}</span>
          }
        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Cerrar notificación"
          (click)="toastService.cerrar()"
        >
          ✕
        </button>
      </div>
    }
  `,
  styleUrl: './toast-notificacion.scss',
})
export class ToastNotificacion {
  protected readonly toastService = inject(ToastService);
}
