import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export type EstadoPedido =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface PedidoAdmin {
  id: string;
  fechaPedido: string;
  total: number;
  direccionEntrega: string;
  instruccionesEntrega?: string;
  estado: EstadoPedido;
  clienteNombre?: string; 
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="admin-dashboard">
      <h1>Panel de Administración</h1>
      <p>Plantilla en construcción.</p>
    </section>
  `,
})
export class AdminDashboardPage {}
