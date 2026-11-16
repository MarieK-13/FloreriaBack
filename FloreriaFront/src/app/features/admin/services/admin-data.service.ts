import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../../core/api/api.config';

export type EstadoPedidoAdmin =
  'PENDIENTE' | 'PAGADO' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export type RolUsuarioAdmin = 'ADMINISTRADOR' | 'OPERARIO' | 'CLIENTE';

export interface ComponenteProductoAdmin {
  cantidad: number;
  descripcion: string;
}

export interface ProductoAdmin {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  disponible: boolean;
  color: string | null;
  tamano: string | null;
  imagenUrl: string | null;
  imagenesGaleria: string[] | null;
  ocasiones: string[] | null;
  componentes: ComponenteProductoAdmin[] | null;
  fechaValidez: string | null;
  categoriaNombre: string;
}

export interface ProductoAdminPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  color: string;
  tamano: string;
  imagenUrl: string;
  imagenesGaleria: string[];
  ocasiones: string[];
  componentes: ComponenteProductoAdmin[];
  fechaValidez: string | null;
  categoriaId: string;
}

export interface CategoriaAdmin {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface PedidoAdmin {
  id: string;
  fechaPedido: string;
  total: number;
  direccionEntrega: string;
  instruccionesEntrega: string | null;
  estado: EstadoPedidoAdmin;
  usuarioId: string;
  usuarioNombre: string | null;
  detalles: {
    productoId: string;
    productoNombre: string;
    cantidad: number;
    subtotal: number;
  }[];
}

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  distrito: string | null;
  direccion: string | null;
  rol: RolUsuarioAdmin;
  activo: boolean;
}

export interface UsuarioAdminPayload {
  nombre: string;
  email: string;
  rol: RolUsuarioAdmin;
  contrasena: string;
}

export interface UsuarioAdminCreatePayload {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  contrasena: string;
  rol: RolUsuarioAdmin;
}

export function adminApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa la conexión e inténtalo otra vez.';
  }
  const message = (error.error as { mensaje?: unknown } | null)?.mensaje;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly http = inject(HttpClient);

  listProducts() {
    return this.http.get<ProductoAdmin[]>(`${API_BASE_URL}/productos`);
  }

  saveProduct(id: string | null, payload: ProductoAdminPayload) {
    return id
      ? this.http.put<ProductoAdmin>(`${API_BASE_URL}/productos/${id}`, payload)
      : this.http.post<ProductoAdmin>(`${API_BASE_URL}/productos`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete<void>(`${API_BASE_URL}/productos/${id}`);
  }

  listCategories() {
    return this.http.get<CategoriaAdmin[]>(`${API_BASE_URL}/categorias`);
  }

  saveCategory(id: string | null, payload: Pick<CategoriaAdmin, 'nombre' | 'descripcion'>) {
    return id
      ? this.http.put<CategoriaAdmin>(`${API_BASE_URL}/categorias/${id}`, payload)
      : this.http.post<CategoriaAdmin>(`${API_BASE_URL}/categorias`, payload);
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${API_BASE_URL}/categorias/${id}`);
  }

  listOrders() {
    return this.http.get<PedidoAdmin[]>(`${API_BASE_URL}/pedidos`);
  }

  updateOrderStatus(id: string, estado: EstadoPedidoAdmin) {
    const params = new HttpParams().set('nuevoEstado', estado);
    return this.http.patch<PedidoAdmin>(`${API_BASE_URL}/pedidos/${id}/estado`, null, { params });
  }

  listUsers() {
    return this.http.get<UsuarioAdmin[]>(`${API_BASE_URL}/usuarios`);
  }

  createUser(payload: UsuarioAdminCreatePayload) {
    return this.http.post<UsuarioAdmin>(`${API_BASE_URL}/usuarios`, payload);
  }

  updateUser(id: string, payload: UsuarioAdminPayload) {
    return this.http.put<UsuarioAdmin>(`${API_BASE_URL}/usuarios/${id}`, payload);
  }

  setUserActive(id: string, active: boolean) {
    const action = active ? 'activar' : 'desactivar';
    return this.http.patch<UsuarioAdmin>(`${API_BASE_URL}/usuarios/${id}/${action}`, null);
  }
}
