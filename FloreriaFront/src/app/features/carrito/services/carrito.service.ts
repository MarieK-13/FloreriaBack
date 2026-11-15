import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/models/product.model';
import { CarritoItem, CheckoutClientePayload } from '../models/carrito.model';
import { ToastService } from '../../../shared/components/toast-notification/service/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})

export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/pedidos/mis-pedidos`;
  private readonly STORAGE_KEY = 'floriasmart_carrito';

  private readonly auth = inject(AuthService);
  private readonly itemsSignal = signal<CarritoItem[]>(this.leerLocalStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalUnidades = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.cantidad, 0),
  );

  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.producto.price * item.cantidad, 0),
  );

  estaLogueado(): boolean {
    return !!this.auth.getToken();
  }

  agregarProducto(producto: Product, cantidad = 1): void {
    if (!producto.available) {
      this.toastService.mostrar(
        'Producto agotado',
        `${producto.name} no está disponible por el momento`,
        'error',
      );
      return;
    }

    const actuales = this.itemsSignal();
    const existente = actuales.find((i) => i.producto.id === producto.id);

    let actualizados: CarritoItem[];
    if (existente) {
      actualizados = actuales.map((i) =>
        i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
      );
    } else {
      actualizados = [...actuales, { producto, cantidad }];
    }

    this.guardarEstado(actualizados);

    this.toastService.mostrar(
      'Agregado al carrito',
      `${producto.name} · S/ ${producto.price.toFixed(2)}`,
      'success',
    );
  }

  actualizarCantidad(productoId: string, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    const actualizados = this.itemsSignal().map((i) =>
      i.producto.id === productoId ? { ...i, cantidad: nuevaCantidad } : i,
    );
    this.guardarEstado(actualizados);
  }

  eliminarProducto(productoId: string): void {
    const eliminado = this.itemsSignal().find((i) => i.producto.id === productoId);
    const actualizados = this.itemsSignal().filter((i) => i.producto.id !== productoId);
    this.guardarEstado(actualizados);

    if (eliminado) {
      this.toastService.mostrar(
        'Eliminado del carrito',
        eliminado.producto.name,
        'info',
      );
    }
  }

  vaciarCarrito(notificar = false): void {
    this.guardarEstado([]);
    if (notificar) {
      this.toastService.mostrar('Carrito vaciado', 'Se quitaron todos los productos', 'info');
    }
  }

  confirmarPedido(direccionEntrega: string, instruccionesEntrega: string): Observable<any> {
    const payload: CheckoutClientePayload = {
      direccionEntrega: direccionEntrega.trim(),
      instruccionesEntrega: instruccionesEntrega.trim(),
      detalles: this.itemsSignal().map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      tap(() => {
        this.vaciarCarrito(false);
        this.toastService.mostrar(
          '¡Pedido confirmado!',
          'Estamos preparando tu arreglo floral',
          'success',
        );
      }),
    );
  }

  private guardarEstado(items: CarritoItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private leerLocalStorage(): CarritoItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
