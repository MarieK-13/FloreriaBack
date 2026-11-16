import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  EstadoPedido,
  PedidoResponse,
  PedidosService,
} from '../../../core/services/pedidos.service';
import { UiIcon } from '../../../shared/components/ui-icon/ui-icon';

type FiltroPedidos = 'TODOS' | 'ACTIVOS' | 'ENTREGADOS' | 'CANCELADOS';

@Component({
  selector: 'app-mis-pedidos-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, UiIcon],
  template: `
    <div class="orders-page">
      <header class="orders-hero">
        <div class="hero-copy">
          <a routerLink="/mi-cuenta" class="back-link">← Volver a Mi cuenta</a>
          <span class="hero-kicker">Historial de compras · FloriaSmart</span>
          <h1>Mis pedidos</h1>
          <p>Consulta el estado de preparación, reparto y detalle de tus arreglos florales.</p>
        </div>

        <div class="hero-stats" aria-label="Resumen de pedidos">
          <div class="stat-card">
            <div class="stat-icon">
              <app-ui-icon name="box" [size]="20" />
            </div>
            <div class="stat-info">
              <span class="stat-label">Total pedidos</span>
              <strong>{{ pedidos().length }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <app-ui-icon name="truck" [size]="20" />
            </div>
            <div class="stat-info">
              <span class="stat-label">En curso</span>
              <strong>{{ pedidosActivos() }}</strong>
            </div>
          </div>

          <div class="stat-card stat-accent">
            <div class="stat-icon">
              <app-ui-icon name="flower" [size]="20" />
            </div>
            <div class="stat-info">
              <span class="stat-label">Explorar tienda</span>
              <a routerLink="/catalogo" class="stat-cta">Nuevo pedido →</a>
            </div>
          </div>
        </div>
      </header>

      <div class="orders-toolbar">
        <div class="filter-pills" role="tablist" aria-label="Filtrar pedidos por estado">
          <button
            type="button"
            [class.active]="filtro() === 'TODOS'"
            (click)="filtro.set('TODOS')"
          >
            Todos ({{ pedidos().length }})
          </button>
          <button
            type="button"
            [class.active]="filtro() === 'ACTIVOS'"
            (click)="filtro.set('ACTIVOS')"
          >
            En curso ({{ pedidosActivos() }})
          </button>
          <button
            type="button"
            [class.active]="filtro() === 'ENTREGADOS'"
            (click)="filtro.set('ENTREGADOS')"
          >
            Entregados ({{ pedidosEntregados() }})
          </button>
          <button
            type="button"
            [class.active]="filtro() === 'CANCELADOS'"
            (click)="filtro.set('CANCELADOS')"
          >
            Cancelados ({{ pedidosCancelados() }})
          </button>
        </div>

        <button type="button" class="refresh-btn" (click)="cargar()" [disabled]="cargando()">
          Actualizar listado
        </button>
      </div>

      @if (errorMensaje()) {
        <div class="state-card state-error" role="alert">
          <p>{{ errorMensaje() }}</p>
          <button type="button" class="primary-btn" (click)="cargar()">Reintentar</button>
        </div>
      } @else if (cargando()) {
        <div class="state-card" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando tu historial de pedidos…</span>
        </div>
      } @else if (pedidosFiltrados().length === 0) {
        <div class="state-card empty-card">
          <div class="empty-icon">
            <app-ui-icon name="flower" [size]="32" />
          </div>
          <h2>
            {{
              pedidos().length === 0
                ? 'Aún no tienes pedidos registrados'
                : 'No hay pedidos en esta categoría'
            }}
          </h2>
          <p>
            {{
              pedidos().length === 0
                ? 'Descubre nuestros ramos y arreglos personalizados para esa ocasión especial.'
                : 'Prueba cambiando el filtro superior para ver otros pedidos.'
            }}
          </p>
          <a routerLink="/catalogo" class="primary-btn">Explorar catálogo floral</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (pedido of pedidosFiltrados(); track pedido.id) {
            <article class="order-card">
              <div class="order-header">
                <div class="order-meta">
                  <span class="order-code">Ticket de recojo: FS-{{ pedido.id.slice(0, 6).toUpperCase() }}</span>
                  <span class="order-date">
                    Realizado el {{ pedido.fechaPedido | date: 'dd/MM/yyyy · HH:mm' }}
                  </span>
                </div>

                <div class="order-status-wrap">
                  <span class="status-badge" [ngClass]="'status-' + pedido.estado.toLowerCase()">
                    {{ etiquetaEstado(pedido.estado) }}
                  </span>
                  <strong class="order-total">
                    {{ pedido.total | currency: 'PEN' : 'S/ ' : '1.2-2' }}
                  </strong>
                </div>
              </div>

              @if (pedido.estado !== 'CANCELADO') {
                <div class="progress-track" aria-label="Progreso del pedido">
                  @for (paso of pasosFlujo; track paso.estado; let i = $index) {
                    <div
                      class="progress-step"
                      [class.done]="indiceEstado(pedido.estado) >= i"
                      [class.current]="pedido.estado === paso.estado"
                    >
                      <span class="step-dot"></span>
                      <span class="step-label">{{ paso.etiqueta }}</span>
                    </div>
                  }
                </div>
              }

              <div class="order-body">
                <div class="order-items">
                  <h3>Arreglos incluidos ({{ pedido.detalles.length }})</h3>
                  <ul>
                    @for (item of pedido.detalles; track item.id) {
                      <li>
                        <div class="item-main">
                          <span class="item-qty">{{ item.cantidad }}×</span>
                          <a [routerLink]="['/productos', item.productoId]" class="item-name">
                            {{ item.productoNombre }}
                          </a>
                        </div>
                        <div class="item-prices">
                          <span class="unit-price">
                            {{ item.precioUnitario | currency: 'PEN' : 'S/ ' : '1.2-2' }} c/u
                          </span>
                          <strong>
                            {{ item.subtotal | currency: 'PEN' : 'S/ ' : '1.2-2' }}
                          </strong>
                        </div>
                      </li>
                    }
                  </ul>
                </div>

                <aside class="order-delivery">
                  <h3>Datos de entrega</h3>
                  <div class="delivery-row">
                    <app-ui-icon name="pin" [size]="17" />
                    <div>
                      <span class="delivery-label">Dirección</span>
                      <p>{{ pedido.direccionEntrega || 'No especificada' }}</p>
                    </div>
                  </div>

                  @if (pedido.instruccionesEntrega) {
                    <div class="delivery-row">
                      <app-ui-icon name="chat" [size]="17" />
                      <div>
                        <span class="delivery-label">Indicaciones / Dedicatoria</span>
                        <p>{{ pedido.instruccionesEntrega }}</p>
                      </div>
                    </div>
                  }
                </aside>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './mis-pedidos.page.scss',
})
export class MisPedidosPage implements OnInit {
  private readonly pedidosService = inject(PedidosService);

  protected readonly pedidos = signal<PedidoResponse[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly filtro = signal<FiltroPedidos>('TODOS');

  protected readonly pasosFlujo: { estado: EstadoPedido; etiqueta: string }[] = [
    { estado: 'PENDIENTE', etiqueta: 'Recibido' },
    { estado: 'PAGADO', etiqueta: 'Pagado' },
    { estado: 'EN_PREPARACION', etiqueta: 'En taller floral' },
    { estado: 'EN_CAMINO', etiqueta: 'En reparto' },
    { estado: 'ENTREGADO', etiqueta: 'Entregado' },
  ];

  protected readonly pedidosActivos = computed(
    () =>
      this.pedidos().filter((p) =>
        ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO'].includes(p.estado),
      ).length,
  );

  protected readonly pedidosEntregados = computed(
    () => this.pedidos().filter((p) => p.estado === 'ENTREGADO').length,
  );

  protected readonly pedidosCancelados = computed(
    () => this.pedidos().filter((p) => p.estado === 'CANCELADO').length,
  );

  protected readonly pedidosFiltrados = computed(() => {
    const actual = this.filtro();
    const lista = this.pedidos();
    if (actual === 'ACTIVOS') {
      return lista.filter((p) =>
        ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO'].includes(p.estado),
      );
    }
    if (actual === 'ENTREGADOS') {
      return lista.filter((p) => p.estado === 'ENTREGADO');
    }
    if (actual === 'CANCELADOS') {
      return lista.filter((p) => p.estado === 'CANCELADO');
    }
    return lista;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.pedidosService.obtenerMisPedidos().subscribe({
      next: (lista) => {
        const ordenados = [...lista].sort(
          (a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime(),
        );
        this.pedidos.set(ordenados);
        this.cargando.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.mensaje ||
          err?.error?.message ||
          'No se pudieron cargar tus pedidos en este momento.';
        this.errorMensaje.set(msg);
        this.cargando.set(false);
      },
    });
  }

  protected etiquetaEstado(estado: EstadoPedido): string {
    const mapa: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente de pago',
      PAGADO: 'Pagado',
      EN_PREPARACION: 'En preparación',
      EN_CAMINO: 'En camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return mapa[estado] ?? estado;
  }

  protected indiceEstado(estado: EstadoPedido): number {
    return this.pasosFlujo.findIndex((p) => p.estado === estado);
  }
}
