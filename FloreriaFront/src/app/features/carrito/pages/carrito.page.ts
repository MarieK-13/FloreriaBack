import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito-page',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  template: `
    <div class="cart-page">
      <header class="cart-header">
        <div>
          <span class="eyebrow-tag">TU SELECCIÓN FLORAL</span>
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
        <section class="ticket-wrapper">
          <article class="pickup-ticket">
            <div class="ticket-top">
              <span class="ticket-badge">TICKET OFICIAL DE RECOJO</span>
              <h2>FloriaSmart · Taller Floral Ica</h2>
              <p>Muestra este código digital o impreso en recepción para abonar y retirar tu arreglo.</p>

              <div class="ticket-code-box">
                <span class="code-label">CÓDIGO ÚNICO DE PEDIDO</span>
                <strong class="code-value">FS-{{ pedido.id?.slice(0, 6)?.toUpperCase() }}</strong>
              </div>
            </div>

            <div class="ticket-perforation" aria-hidden="true">
              <span></span>
              <div class="dashed-line"></div>
              <span></span>
            </div>

            <div class="ticket-details">
              <div class="detail-row">
                <span>Establecimiento</span>
                <strong>Sede Principal Ica (Av. San Martín 420)</strong>
              </div>
              <div class="detail-row">
                <span>Modalidad</span>
                <strong>Recojo en tienda</strong>
              </div>
              <div class="detail-row">
                <span>Datos y Horario</span>
                <strong>{{ pedido.instruccionesEntrega }}</strong>
              </div>
              <div class="detail-row">
                <span>Modalidad de pago</span>
                <strong>Pago presencial en recepción (Efectivo, Yape, Plin o Tarjeta)</strong>
              </div>
              <div class="detail-row">
                <span>Fecha de emisión</span>
                <strong>{{ pedido.fechaPedido | date: 'dd/MM/yyyy · HH:mm' }}</strong>
              </div>
              <div class="detail-row">
                <span>Estado actual</span>
                <strong class="status-pill">{{ pedido.estado || 'PENDIENTE' }}</strong>
              </div>
              <div class="detail-row total-line">
                <span>Total a abonar en tienda</span>
                <strong>{{ pedido.total | currency: 'PEN' : 'S/ ' }}</strong>
              </div>
            </div>

            <div class="ticket-actions">
              <button type="button" class="btn-outline-pill" (click)="imprimirTicket()">
                🖨️ Imprimir / Guardar PDF
              </button>
              <a routerLink="/mis-pedidos" class="btn-brand-pill">Ver en Mis pedidos</a>
            </div>
          </article>

          <a routerLink="/catalogo" class="back-catalog-link">← Seguir explorando catálogo</a>
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
                    {{ item.producto.price | currency: 'PEN' : 'S/ ' }} por unidad
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
            <div class="checkout-head">
              <h2>Resumen y recojo</h2>
              <span class="store-tag">📍 Recojo en tienda</span>
            </div>

            <p class="store-note">
              Av. San Martín 420, Ica · <span>Envíos a domicilio próximamente</span>
            </p>

            @if (!carritoService.estaLogueado()) {
              <div class="login-prompt">
                <p>Inicia sesión para generar tu ticket de recojo en recepción.</p>
                <a
                  routerLink="/ingresar"
                  [queryParams]="{ redirect: '/carrito' }"
                  class="btn-brand-pill full-width"
                >
                  Iniciar sesión
                </a>
              </div>
            } @else {
              <form (ngSubmit)="procesarCompra()" class="checkout-form">
                <label class="field">
                  <span>Persona que recoge *</span>
                  <input
                    type="text"
                    name="nombreRecoge"
                    [(ngModel)]="nombreRecoge"
                    required
                    placeholder="Nombre completo de quien retira"
                  />
                </label>

                <div class="fields-row">
                  <label class="field">
                    <span>Fecha de recojo *</span>
                    <select name="diaRecojo" [(ngModel)]="diaRecojo">
                      @for (opcion of opcionesFecha; track opcion) {
                        <option [value]="opcion">{{ opcion }}</option>
                      }
                    </select>
                  </label>

                  <label class="field">
                    <span>Horario de recojo *</span>
                    <select name="franjaHoraria" [(ngModel)]="franjaHoraria">
                      <option value="9:30 a. m. - 12:30 p. m.">9:30 a. m. – 12:30 p. m.</option>
                      <option value="12:30 p. m. - 4:00 p. m.">12:30 p. m. – 4:00 p. m.</option>
                      <option value="4:00 p. m. - 7:30 p. m.">4:00 p. m. – 7:30 p. m.</option>
                    </select>
                  </label>
                </div>

                <label class="field">
                  <span>Dedicatoria para tarjeta (opcional)</span>
                  <textarea
                    name="dedicatoria"
                    [(ngModel)]="dedicatoria"
                    rows="2"
                    placeholder="Mensaje breve para imprimir en la tarjeta..."
                  ></textarea>
                </label>

                <div class="payment-notice">
                  <span aria-hidden="true">💳</span>
                  <p>
                    <strong>Pago en tienda al recoger:</strong> no se realiza cobro en línea.
                    Abonas en recepción (efectivo, Yape, Plin o tarjeta) presentando tu ticket.
                  </p>
                </div>

                @if (errorMensaje()) {
                  <p class="error-banner" role="alert">{{ errorMensaje() }}</p>
                }

                <div class="summary-lines">
                  <div class="summary-row">
                    <span>Productos ({{ carritoService.totalUnidades() }})</span>
                    <span>{{ carritoService.subtotal() | currency: 'PEN' : 'S/ ' }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Tarjeta y recojo en recepción</span>
                    <span class="free-tag">Incluido</span>
                  </div>
                  <div class="summary-row total-row">
                    <span>Total a pagar en tienda</span>
                    <strong>{{ carritoService.subtotal() | currency: 'PEN' : 'S/ ' }}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-confirm-order"
                  [disabled]="enviando() || !nombreRecoge.trim()"
                >
                  {{ enviando() ? 'Generando ticket...' : 'Generar ticket de recojo' }}
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
export class CarritoPage implements OnInit {
  protected readonly carritoService = inject(CarritoService);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  protected readonly opcionesFecha = this.generarProximasFechas();

  protected nombreRecoge = '';
  protected diaRecojo = this.opcionesFecha[0];
  protected franjaHoraria = '12:30 p. m. - 4:00 p. m.';
  protected dedicatoria = '';

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly pedidoConfirmado = signal<any | null>(null);

  ngOnInit(): void {
    if (this.carritoService.estaLogueado()) {
      this.accountService.getProfile().subscribe({
        next: (perfil) => {
          if (!this.nombreRecoge.trim() && perfil.nombre) {
            this.nombreRecoge = perfil.nombre.trim();
          }
        },
      });
    }
  }

  protected procesarCompra(): void {
    if (!this.carritoService.estaLogueado()) {
      void this.router.navigate(['/ingresar'], { queryParams: { redirect: '/carrito' } });
      return;
    }

    if (!this.nombreRecoge.trim()) {
      this.errorMensaje.set('Indica el nombre de quien recogerá el pedido.');
      return;
    }

    const direccionTienda = 'Recojo en tienda · Sede Principal Ica (Av. San Martín 420)';
    const instruccionesRecojo = [
      `Recoge: ${this.nombreRecoge.trim()}`,
      `Fecha: ${this.diaRecojo} (${this.franjaHoraria})`,
      'Pago en recepción',
      this.dedicatoria.trim() ? `Tarjeta: "${this.dedicatoria.trim()}"` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    this.enviando.set(true);
    this.errorMensaje.set(null);

    this.carritoService.confirmarPedido(direccionTienda, instruccionesRecojo).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);
        this.pedidoConfirmado.set(respuesta);
      },
      error: (err) => {
        this.enviando.set(false);
        const mensajeBackend =
          err?.error?.mensaje ||
          err?.error?.message ||
          'No se pudo procesar el pedido. Verifica el stock disponible.';
        this.errorMensaje.set(mensajeBackend);
      },
    });
  }

  protected imprimirTicket(): void {
    window.print();
  }

  private generarProximasFechas(): string[] {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const lista: string[] = [];

    for (let i = 0; i < 5; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      const etiquetaFecha = `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
      if (i === 0) {
        lista.push(`Hoy · ${etiquetaFecha}`);
      } else if (i === 1) {
        lista.push(`Mañana · ${etiquetaFecha}`);
      } else {
        lista.push(etiquetaFecha);
      }
    }
    return lista;
  }
}
