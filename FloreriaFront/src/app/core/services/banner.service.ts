import { Injectable, signal } from '@angular/core';
import { Banner } from '../../shared/models/banner.model';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private readonly STORAGE_KEY = 'floreriasmart_banners_demo';

  private readonly _banners = signal<Banner[]>(this.cargarIniciales());
  readonly bannersActivos = this._banners.asReadonly();

  private cargarIniciales(): Banner[] {
    const guardados = localStorage.getItem(this.STORAGE_KEY);
    if (guardados) {
      return JSON.parse(guardados);
    }
    return [];
  }

  agregarBannerDemo(titulo: string, imagenBase64: string, enlaceDestino: string): void {
    const nuevo: Banner = {
      id: Date.now(),
      titulo,
      imagenUrl: imagenBase64,
      enlaceDestino: enlaceDestino || '/catalogo',
      orden: this._banners().length + 1,
      activo: true,
    };

    const actualizados = [...this._banners(), nuevo];
    this._banners.set(actualizados);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actualizados));
  }

  eliminarBannerDemo(id: number): void {
    const actualizados = this._banners().filter((b) => b.id !== id);
    this._banners.set(actualizados);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actualizados));
  }
}
