import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AdminDataService,
  adminApiErrorMessage,
  EstadoPedidoAdmin,
  PedidoAdmin,
} from '../services/admin-data.service';

const ORDER_TRANSITIONS: Record<EstadoPedidoAdmin, EstadoPedidoAdmin[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  PAGADO: ['ENTREGADO'],
  EN_PREPARACION: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['PAGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

const ORDER_STATUS_LABELS: Record<EstadoPedidoAdmin, string> = {
  PENDIENTE: 'Pedido recibido',
  PAGADO: 'Pago en tienda',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'Listo para recoger',
  ENTREGADO: 'Retirado',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="admin-section">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Operaciones</p>
          <h1>Pedidos</h1>
          <p>Revisa las compras y actualiza su estado de preparación y recojo en tienda.</p>
        </div>
        <button
          type="button"
          class="secondary-button"
          (click)="loadOrders()"
          [disabled]="isLoading()"
        >
          Actualizar
        </button>
      </header>

      @if (errorMessage()) {
        <p class="notice notice--error" role="alert">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="notice notice--success" role="status">{{ successMessage() }}</p>
      }

      <section class="management-panel">
        <div class="orders-heading">
          <h2>Todos los pedidos</h2>
          <span class="item-count">{{ filteredOrders().length }} pedidos</span>
        </div>

        @if (isLoading()) {
          <p class="list-status" role="status">Cargando pedidos...</p>
        } @else if (filteredOrders().length === 0) {
          <p class="list-status">No hay pedidos registrados.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Total</th>
                  <th scope="col">Actualizar</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.id) {
                  <tr>
                    <td>
                      <strong>Ticket: FS-{{ order.id.slice(0, 6).toUpperCase() }}</strong>
                    </td>
                    <td>{{ order.usuarioNombre || 'Cliente' }}</td>
                    <td class="order-products">
                      @for (detail of order.detalles; track detail.productoId) {
                        <span>{{ detail.cantidad }} × {{ detail.productoNombre }}</span>
                      }
                    </td>
                    <td>{{ order.fechaPedido | date: 'dd/MM/yy, HH:mm' }}</td>
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
                    <td>
                      @if (transitionsFor(order).length > 0) {
                        <label class="visually-hidden" [for]="'order-state-' + order.id">
                          Cambiar estado del pedido {{ order.id.slice(0, 8) }}
                        </label>
                        <select
                          [id]="'order-state-' + order.id"
                          [value]="order.estado"
                          [disabled]="updatingOrderId() === order.id"
                          (change)="changeStatus(order, $event)"
                        >
                          <option [value]="order.estado">{{ statusLabel(order.estado) }}</option>
                          @for (state of transitionsFor(order); track state) {
                            <option [value]="state">{{ statusLabel(state) }}</option>
                          }
                        </select>
                      } @else {
                        <small class="muted">Finalizado</small>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </section>
  `,
  styleUrl: './admin-orders.page.scss',
})
export class AdminOrdersPage {
  private readonly api = inject(AdminDataService);
  private readonly orders = signal<PedidoAdmin[]>([]);

  protected readonly isLoading = signal(true);
  protected readonly updatingOrderId = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly filteredOrders = computed(() =>
    [...this.orders()].sort((a, b) => b.fechaPedido.localeCompare(a.fechaPedido)),
  );

  constructor() {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.api.listOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(adminApiErrorMessage(error, 'No se pudieron cargar los pedidos.'));
        this.isLoading.set(false);
      },
    });
  }

  protected transitionsFor(order: PedidoAdmin): EstadoPedidoAdmin[] {
    return ORDER_TRANSITIONS[order.estado];
  }

  protected statusLabel(status: EstadoPedidoAdmin): string {
    return ORDER_STATUS_LABELS[status];
  }

  protected changeStatus(order: PedidoAdmin, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const allowed = this.transitionsFor(order);
    if (!allowed.some((state) => state === value)) {
      return;
    }

    const nextState = value as EstadoPedidoAdmin;
    this.updatingOrderId.set(order.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.updateOrderStatus(order.id, nextState).subscribe({
      next: (updatedOrder) => {
        this.orders.update((orders) =>
          orders.map((current) => (current.id === updatedOrder.id ? updatedOrder : current)),
        );
        this.updatingOrderId.set(null);
        this.successMessage.set(`Pedido actualizado a "${this.statusLabel(updatedOrder.estado)}".`);
      },
      error: (error: unknown) => {
        this.updatingOrderId.set(null);
        const message = adminApiErrorMessage(error, 'No se pudo cambiar el estado del pedido.');
        this.reloadOrders(message);
      },
    });
  }

  private reloadOrders(errorMessage = ''): void {
    this.isLoading.set(true);
    this.api.listOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
        if (errorMessage) {
          this.errorMessage.set(errorMessage);
        }
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          errorMessage
            ? `${errorMessage} No se pudo actualizar la lista de pedidos.`
            : adminApiErrorMessage(error, 'No se pudieron cargar los pedidos.'),
        );
      },
    });
  }
}
