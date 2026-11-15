import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito-page',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  template: `
    <div class="cart-page full-bounds">
      <header class="cart-header">
        <div>
          <span class="eyebrow-tag">TU PEDIDO FLORAL</span>
          <h1>Carrito de compras</h1>
        </div>

        @if (carritoService.items().length > 0 && !pedidoConfirmado()) {
          <button
            type="button"
            class="btn-outline-pill"
            (click)="carritoService.vaciarCarrito(true)"
          >
            Vaciar carrito
          </button>
        }
      </header>

      @if (pedidoConfirmado(); as pedido) {
        <section class="success-card">
          <div class="success-icon" aria-hidden="true">✓</div>
          <span class="eyebrow-tag">¡PEDIDO REGISTRADO!</span>
          <h2>Gracias por confiar en FloriaSmart</h2>
          <p>Hemos recibido tu pedido y nuestro equipo floral comenzará a prepararlo.</p>

          <div class="order-summary-pill">
            <div>
              <span>Código de pedido</span>
              <strong>#{{ pedido.id?.slice(0, 8)?.toUpperCase() }}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{{ pedido.estado || 'PENDIENTE' }}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{{ pedido.total | currency: 'PEN' : 'S/ ' }}</strong>
            </div>
          </div>

          <div class="success-actions">
            <a routerLink="/catalogo" class="btn-brand-pill">Seguir explorando catálogo</a>
          </div>
        </section>
      } @else if (carritoService.items().length === 0) {
        <section class="empty-state">
          <div class="empty-icon" aria-hidden="true">✿</div>
          <h2>Tu carrito está vacío</h2>
          <p>
            Descubre nuestros ramos frescos, boxes de rosas y detalles diseñados para sorprender.
          </p>
          <a routerLink="/catalogo" class="btn-brand-pill">Explorar catálogo floral</a>
        </section>
      } @else {
        <div class="cart-layout">
          <section class="cart-items-col" aria-label="Productos en el carrito">
            @for (item of carritoService.items(); track item.producto.id) {
              <article class="cart-item-card">
                <div
                  class="item-thumb"
                  [style.backgroundImage]="
                    item.producto.imageUrl ? 'url(' + item.producto.imageUrl + ')' : null
                  "
                >
                  @if (!item.producto.imageUrl) {
                    <span>✿</span>
                  }
                </div>

                <div class="item-info">
                  <span class="item-cat">{{ item.producto.category }}</span>
                  <h3>{{ item.producto.name }}</h3>
                  <p class="item-unit-price">
                    {{ item.producto.price | currency: 'PEN' : 'S/ ' }} c/u
                  </p>
                </div>

                <div class="item-controls">
                  <div class="qty-stepper">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      (click)="
                        carritoService.actualizarCantidad(item.producto.id, item.cantidad - 1)
                      "
                    >
                      −
                    </button>
                    <span>{{ item.cantidad }}</span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      (click)="
                        carritoService.actualizarCantidad(item.producto.id, item.cantidad + 1)
                      "
                    >
                      +
                    </button>
                  </div>

                  <strong class="item-subtotal">
                    {{ item.producto.price * item.cantidad | currency: 'PEN' : 'S/ ' }}
                  </strong>

                  <button
                    type="button"
                    class="remove-btn"
                    title="Eliminar producto"
                    aria-label="Eliminar producto"
                    (click)="carritoService.eliminarProducto(item.producto.id)"
                  >
                    ✕
                  </button>
                </div>
              </article>
            }
          </section>

          <aside class="checkout-panel">
            <h2>Datos de entrega</h2>

            @if (!carritoService.estaLogueado()) {
              <div class="login-prompt">
                <p>
                  Para confirmar tu pedido y hacer seguimiento a tu entrega, inicia sesión con tu
                  cuenta.
                </p>
                <a
                  routerLink="/ingresar"
                  [queryParams]="{ redirect: '/carrito' }"
                  class="btn-brand-pill full-width"
                >
                  Iniciar sesión para continuar
                </a>
              </div>
            } @else {
              <form (ngSubmit)="procesarCompra()" class="checkout-form">
                <label class="field">
                  <span>Dirección de entrega *</span>
                  <input
                    type="text"
                    name="direccionEntrega"
                    [(ngModel)]="direccionEntrega"
                    required
                    placeholder="Ej. Av. San Martín 450, Dpto 302, Ica"
                  />
                </label>

                <label class="field">
                  <span>Dedicatoria para tarjeta e instrucciones</span>
                  <textarea
                    name="instruccionesEntrega"
                    [(ngModel)]="instruccionesEntrega"
                    rows="3"
                    placeholder="Mensaje para la tarjeta dedicatoria, horario preferido o referencia de la casa..."
                  ></textarea>
                </label>

                @if (errorMensaje()) {
                  <p class="error-banner">{{ errorMensaje() }}</p>
                }

                <div class="summary-lines">
                  <div class="summary-row">
                    <span>Productos ({{ carritoService.totalUnidades() }})</span>
                    <span>{{ carritoService.subtotal() | currency: 'PEN' : 'S/ ' }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Tarjeta dedicatoria</span>
                    <span class="free-tag">Incluida</span>
                  </div>
                  <div class="summary-row total-row">
                    <span>Total a pagar</span>
                    <strong>{{ carritoService.subtotal() | currency: 'PEN' : 'S/ ' }}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-brand-pill full-width"
                  [disabled]="enviando() || !direccionEntrega.trim()"
                >
                  {{ enviando() ? 'Procesando pedido...' : 'Confirmar pedido' }}
                </button>
              </form>
            }
          </aside>
        </div>
      }
    </div>
  `,
  styleUrl: './carrito.page.scss',
})
export class CarritoPage {
  protected readonly carritoService = inject(CarritoService);
  private readonly router = inject(Router);

  protected direccionEntrega = '';
  protected instruccionesEntrega = '';
  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly pedidoConfirmado = signal<any | null>(null);

  protected procesarCompra(): void {
    if (!this.carritoService.estaLogueado()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrito' } });
      return;
    }

    if (!this.direccionEntrega.trim()) {
      this.errorMensaje.set('Por favor ingresa la dirección de entrega.');
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    this.carritoService
      .confirmarPedido(this.direccionEntrega, this.instruccionesEntrega)
      .subscribe({
        next: (respuesta) => {
          this.enviando.set(false);
          this.pedidoConfirmado.set(respuesta);
        },
        error: (err) => {
          this.enviando.set(false);
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            'No se pudo registrar el pedido. Verifica el stock disponible e inténtalo de nuevo.';
          this.errorMensaje.set(msg);
        },
      });
  }
}
