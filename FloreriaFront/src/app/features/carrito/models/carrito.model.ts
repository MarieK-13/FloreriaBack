import { Product } from '../../../shared/models/product.model';

export interface CarritoItem {
  producto: Product;
  cantidad: number;
}

export interface DetallePedidoPayload {
  productoId: string;
  cantidad: number;
}

export interface CheckoutClientePayload {
  direccionEntrega: string;
  instruccionesEntrega: string;
  detalles: DetallePedidoPayload[];
}
