import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/services/auth.service';

type EstadoPedido =
  'PENDIENTE' | 'PAGADO' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

interface DetallePedido {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  subtotal: number;
}

interface PedidoAdmin {
  id: string;
  fechaPedido: string;
  total: number;
  estado: EstadoPedido;
  usuarioNombre: string | null;
  detalles: DetallePedido[];
}

interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  cantidadPedidos: number;
  totalVendido: number;
}

interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  unidades: number;
  totalVendido: number;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="admin-dashboard">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">FloriaSmart · Administración</p>
          <h1>Resumen del negocio</h1>
          <p class="dashboard-description">
            Revisa las ventas, los pedidos y los productos más solicitados.
          </p>
        </div>
      </header>

      <form class="date-filter" (submit)="applyFilters($event)">
        <label>
          <span>Desde</span>
          <input
            type="date"
            [value]="startDate()"
            (input)="updateStartDate($event)"
            aria-label="Fecha inicial"
          />
        </label>
        <label>
          <span>Hasta</span>
          <input
            type="date"
            [value]="endDate()"
            (input)="updateEndDate($event)"
            aria-label="Fecha final"
          />
        </label>
        <button class="filter-button" type="submit" [disabled]="isLoading()">Aplicar fechas</button>
        <button
          class="month-button"
          type="button"
          (click)="showCurrentMonth()"
          [disabled]="isLoading()"
        >
          Este mes
        </button>
      </form>

      @if (errorMessage()) {
        <div class="dashboard-error" role="alert">
          <p>{{ errorMessage() }}</p>
          <button type="button" class="month-button" (click)="loadDashboard()">Reintentar</button>
        </div>
      } @else if (isLoading()) {
        <p class="dashboard-status" role="status">Cargando resumen...</p>
      } @else if (report(); as summary) {
        <section class="metrics-grid" aria-label="Resumen de ventas">
          <article class="metric-card metric-card--sales">
            <span class="metric-icon" aria-hidden="true">$</span>
            <p>Ventas registradas</p>
            <strong>{{
              summary.totalVendido | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE'
            }}</strong>
            <small>No incluye pedidos cancelados</small>
          </article>
          <article class="metric-card">
            <span class="metric-icon metric-icon--rose" aria-hidden="true">#</span>
            <p>Pedidos del período</p>
            <strong>{{ summary.cantidadPedidos }}</strong>
            <small>Pedidos no cancelados</small>
          </article>
          <article class="metric-card">
            <span class="metric-icon metric-icon--gold" aria-hidden="true">↗</span>
            <p>Ticket promedio</p>
            <strong>{{ averageTicket() | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}</strong>
            <small>Por pedido no cancelado</small>
          </article>
          <article class="metric-card">
            <span class="metric-icon metric-icon--rose" aria-hidden="true">◷</span>
            <p>Por atender</p>
            <strong>{{ pendingOrdersCount() }}</strong>
            <small>Pedidos pendientes</small>
          </article>
        </section>

        <div class="dashboard-content">
          <section class="dashboard-panel" aria-labelledby="top-products-title">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Lo más elegido</p>
                <h2 id="top-products-title">Productos más vendidos</h2>
              </div>
              <span class="panel-period">
                {{ startDate() | date: 'dd/MM/yy' : 'UTC' }} —
                {{ endDate() | date: 'dd/MM/yy' : 'UTC' }}
              </span>
            </div>

            @if (topProducts().length > 0) {
              <ol class="top-products">
                @for (product of topProducts(); track product.productoId; let index = $index) {
                  <li>
                    <span class="product-rank">{{ index + 1 }}</span>
                    <span class="product-info">
                      <strong>{{ product.nombre }}</strong>
                      <small>{{ product.unidades }} unidades vendidas</small>
                    </span>
                    <strong class="product-sales">
                      {{ product.totalVendido | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}
                    </strong>
                  </li>
                }
              </ol>
            } @else {
              <p class="empty-state">No hay ventas de productos en este período.</p>
            }
          </section>

          <section class="dashboard-panel orders-panel" aria-labelledby="recent-orders-title">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Seguimiento</p>
                <h2 id="recent-orders-title">Pedidos recientes</h2>
              </div>
              <span class="order-count">{{ orders().length }}</span>
            </div>

            @if (recentOrders().length > 0) {
              <div class="orders-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Pedido</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of recentOrders(); track order.id) {
                      <tr>
                        <td>
                          <strong>#{{ order.id.slice(0, 8) }}</strong>
                          <small>{{ order.fechaPedido | date: 'dd/MM/yy, HH:mm' }}</small>
                        </td>
                        <td>{{ order.usuarioNombre || 'Cliente' }}</td>
                        <td>
                          <span
                            class="status-badge"
                            [class]="'status-badge status--' + order.estado.toLowerCase()"
                          >
                            {{ statusLabel(order.estado) }}
                          </span>
                        </td>
                        <td class="order-total">
                          {{ order.total | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="empty-state">No hay pedidos en este período.</p>
            }
          </section>
        </div>
        <p class="report-note">
          El reporte por ocasión de compra estará disponible cuando los pedidos registren esa
          información.
        </p>
      }
    </section>
  `,
  styleUrl: './admin-dashboard.page.scss',
})
export class AdminDashboardPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  protected readonly startDate = signal(this.firstDayOfCurrentMonth());
  protected readonly endDate = signal(this.today());
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly report = signal<ReporteVentas | null>(null);
  protected readonly orders = signal<PedidoAdmin[]>([]);

  protected readonly averageTicket = computed(() => {
    const summary = this.report();
    return summary && summary.cantidadPedidos > 0
      ? summary.totalVendido / summary.cantidadPedidos
      : 0;
  });
  protected readonly pendingOrdersCount = computed(
    () => this.orders().filter((order) => order.estado === 'PENDIENTE').length,
  );
  protected readonly recentOrders = computed(() =>
    [...this.orders()].sort((a, b) => b.fechaPedido.localeCompare(a.fechaPedido)).slice(0, 5),
  );
  protected readonly topProducts = computed(() => {
    const products = new Map<string, ProductoMasVendido>();

    for (const order of this.orders()) {
      if (order.estado === 'CANCELADO') {
        continue;
      }
      for (const detail of order.detalles ?? []) {
        const product = products.get(detail.productoId) ?? {
          productoId: detail.productoId,
          nombre: detail.productoNombre,
          unidades: 0,
          totalVendido: 0,
        };
        product.unidades += detail.cantidad;
        product.totalVendido += detail.subtotal;
        products.set(detail.productoId, product);
      }
    }

    return [...products.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 5);
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected updateStartDate(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
  }

  protected updateEndDate(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  protected applyFilters(event: Event): void {
    event.preventDefault();
    this.loadDashboard();
  }

  protected showCurrentMonth(): void {
    this.startDate.set(this.firstDayOfCurrentMonth());
    this.endDate.set(this.today());
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    const inicio = this.startDate();
    const fin = this.endDate();
    if (!inicio || !fin || inicio > fin) {
      this.errorMessage.set('Selecciona un rango de fechas válido.');
      return;
    }

    if (!this.auth.hasRole('ADMINISTRADOR')) {
      this.loadOperatorDashboard(inicio, fin);
      return;
    }

    const params = new HttpParams().set('inicio', inicio).set('fin', fin);
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.report.set(null);
    this.orders.set([]);

    forkJoin({
      report: this.http.get<ReporteVentas>(`${API_BASE_URL}/pedidos/reportes/ventas`, { params }),
      orders: this.http.get<PedidoAdmin[]>(`${API_BASE_URL}/pedidos/reportes/rango`, { params }),
    }).subscribe({
      next: ({ report, orders }) => {
        this.report.set(report);
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar el resumen. Revisa la conexión e inténtalo otra vez.',
        );
        this.isLoading.set(false);
      },
    });
  }

  private loadOperatorDashboard(inicio: string, fin: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.report.set(null);
    this.orders.set([]);

    this.http.get<PedidoAdmin[]>(`${API_BASE_URL}/pedidos`).subscribe({
      next: (allOrders) => {
        const orders = allOrders.filter((order) => {
          const orderDate = order.fechaPedido.slice(0, 10);
          return orderDate >= inicio && orderDate <= fin;
        });
        const billableOrders = orders.filter((order) => order.estado !== 'CANCELADO');
        this.orders.set(orders);
        this.report.set({
          fechaInicio: inicio,
          fechaFin: fin,
          cantidadPedidos: billableOrders.length,
          totalVendido: billableOrders.reduce((total, order) => total + order.total, 0),
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar el resumen. Revisa la conexión e inténtalo otra vez.',
        );
        this.isLoading.set(false);
      },
    });
  }

  protected statusLabel(status: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente',
      PAGADO: 'Pagado',
      EN_PREPARACION: 'En preparación',
      EN_CAMINO: 'En camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return labels[status];
  }

  private today(): string {
    return this.toDateInputValue(new Date());
  }

  private firstDayOfCurrentMonth(): string {
    const date = new Date();
    date.setDate(1);
    return this.toDateInputValue(date);
  }

  private toDateInputValue(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
