import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  titulo: string;
  detalle?: string;
  tipo: 'success' | 'info' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastSignal = signal<ToastMessage | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly toastActual = this.toastSignal.asReadonly();

  mostrar(titulo: string, detalle?: string, tipo: 'success' | 'info' | 'error' = 'success'): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.toastSignal.set({
      id: Date.now(),
      titulo,
      detalle,
      tipo,
    });

    this.timeoutId = setTimeout(() => {
      this.cerrar();
    }, 3000);
  }

  cerrar(): void {
    this.toastSignal.set(null);
  }
}
