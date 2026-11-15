import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../shared/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/favoritos`;
  private readonly STORAGE_KEY = 'floriasmart_favoritos';
  private readonly STORAGE_PRODUCTS_KEY = 'floriasmart_favoritos_items';

  private readonly idsSignal = signal<string[]>(this.leerIdsLocal());
  private readonly productosLocalSignal = signal<Product[]>(this.leerProductosLocal());

  readonly idsFavoritos = this.idsSignal.asReadonly();
  readonly productosLocales = this.productosLocalSignal.asReadonly();
  readonly totalFavoritos = computed(() => this.idsSignal().length);

  constructor() {
    if (this.estaLogueado()) {
      this.sincronizarYCargarDesdeBackend();
    }
  }

  estaLogueado(): boolean {
    return !!this.auth.getToken();
  }

  esFavorito(productoId: string): boolean {
    return this.idsSignal().includes(productoId);
  }

  sincronizarYCargarDesdeBackend(): void {
    if (!this.estaLogueado()) return;

    const locales = this.leerIdsLocal();
    if (locales.length > 0) {
      this.http.post<string[]>(`${this.apiUrl}/sincronizar`, locales).subscribe({
        next: (idsBackend) => {
          this.idsSignal.set(idsBackend);
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.STORAGE_PRODUCTS_KEY);
          this.productosLocalSignal.set([]);
        },
        error: () => this.cargarSoloIdsBackend(),
      });
    } else {
      this.cargarSoloIdsBackend();
    }
  }

  /** Llamar al cerrar sesión para limpiar en memoria los favoritos de la cuenta anterior */
  limpiarSesionLocal(): void {
    this.idsSignal.set(this.leerIdsLocal());
    this.productosLocalSignal.set(this.leerProductosLocal());
  }

  private cargarSoloIdsBackend(): void {
    this.http.get<string[]>(`${this.apiUrl}/ids`).subscribe({
      next: (ids) => this.idsSignal.set(ids),
    });
  }

  toggleFavorito(productoId: string, producto?: Product): void {
    if (this.estaLogueado()) {
      const previos = this.idsSignal();
      const yaEstaba = previos.includes(productoId);
      const optimista = yaEstaba
        ? previos.filter((id) => id !== productoId)
        : [...previos, productoId];
      this.idsSignal.set(optimista);

      this.http.post<string[]>(`${this.apiUrl}/${productoId}/toggle`, {}).subscribe({
        next: (idsReales) => this.idsSignal.set(idsReales),
        error: () => this.idsSignal.set(previos),
      });
    } else {
      const actuales = this.idsSignal();
      const yaEstaba = actuales.includes(productoId);

      const idsActualizados = yaEstaba
        ? actuales.filter((id) => id !== productoId)
        : [...actuales, productoId];

      this.idsSignal.set(idsActualizados);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(idsActualizados));

      const prodsActuales = this.productosLocalSignal();
      let prodsActualizados: Product[];

      if (yaEstaba) {
        prodsActualizados = prodsActuales.filter((p) => p.id !== productoId);
      } else if (producto) {
        prodsActualizados = [...prodsActuales.filter((p) => p.id !== productoId), producto];
      } else {
        prodsActualizados = prodsActuales;
      }

      this.productosLocalSignal.set(prodsActualizados);
      localStorage.setItem(this.STORAGE_PRODUCTS_KEY, JSON.stringify(prodsActualizados));
    }
  }

  obtenerProductosFavoritosBackend(): Observable<any[]> {
    if (!this.estaLogueado()) {
      return of([]);
    }

    const locales = this.leerIdsLocal();
    if (locales.length > 0) {
      return this.http.post<string[]>(`${this.apiUrl}/sincronizar`, locales).pipe(
        tap((idsBackend) => {
          this.idsSignal.set(idsBackend);
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.STORAGE_PRODUCTS_KEY);
          this.productosLocalSignal.set([]);
        }),
        switchMap(() => this.http.get<any[]>(this.apiUrl)),
        catchError(() => this.http.get<any[]>(this.apiUrl)),
      );
    }

    return this.http.get<any[]>(this.apiUrl);
  }

  vaciarFavoritos(): Observable<void> {
    this.idsSignal.set([]);
    this.productosLocalSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_PRODUCTS_KEY);

    if (this.estaLogueado()) {
      return this.http.delete<void>(this.apiUrl).pipe(tap(() => this.idsSignal.set([])));
    }
    return of(undefined);
  }

  private leerIdsLocal(): string[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private leerProductosLocal(): Product[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
