import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import {
  Product,
  ProductCategory,
  ProductTechnicalDetails,
  StoreCatalog,
} from '../../../shared/models/product.model';
import { API_BASE_URL } from '../../../core/api/api.config';

interface ProductResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  disponible: boolean;
  color: string | null;
  tamano: string | null;
  imagenUrl?: string | null;
  ocasiones?: string[];
  componentes?: { cantidad: number; descripcion: string }[];
  fechaValidez?: string | null;
  categoriaNombre: string;
}

interface CategoryResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface TechnicalDetailsResponse {
  productoId: string;
  cuidados: string | null;
  duracionDias: number | null;
  materiales: string | null;
  ocasion: string | null;
  instruccionesEntrega: string | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  getCatalog(): Observable<StoreCatalog> {
    return forkJoin({
      products: this.http.get<ProductResponse[]>(`${API_BASE_URL}/productos`),
      categories: this.http.get<CategoryResponse[]>(`${API_BASE_URL}/categorias`),
      technicalDetails: this.http
        .get<TechnicalDetailsResponse[]>(`${API_BASE_URL}/detalle-productos`)
        .pipe(catchError(() => of([]))),
    }).pipe(
      map(({ products, categories, technicalDetails }) => {
        const detailByProductId = new Map(
          technicalDetails.map((details) => [details.productoId, this.mapDetails(details)]),
        );

        return {
          categories: categories.map((category) => this.mapCategory(category)),
          products: products.map((product) =>
            this.mapProduct(
              product,
              detailByProductId.get(product.id),
              categories.find((category) => category.nombre === product.categoriaNombre)?.id ?? '',
            ),
          ),
        };
      }),
    );
  }

  private mapProduct(
    response: ProductResponse,
    details?: ProductTechnicalDetails,
    categoryId = '',
  ): Product {
    const color = response.color ?? '';
    const size = response.tamano ?? '';
    const occasion = response.ocasiones?.length
      ? response.ocasiones.join(', ')
      : (details?.occasion ?? '');
    const category = response.categoriaNombre;
    const components = (response.componentes ?? []).map((c) => ({
      quantity: c.cantidad,
      description: c.descripcion,
    }));
    const kind =
      components.length > 0 || category.toLocaleLowerCase('es').includes('pack')
        ? 'pack'
        : 'product';
    const tags = [color, size, occasion].filter(Boolean);

    return {
      id: response.id,
      categoryId,
      category,
      kind,
      name: response.nombre,
      description: response.descripcion ?? '',
      price: response.precio,
      stock: response.stock,
      available: response.disponible && response.stock > 0,
      color,
      size,
      occasion,
      imageUrl: response.imagenUrl ?? undefined,
      components,
      validUntil: response.fechaValidez ?? undefined,
      durationDays: details?.durationDays ?? undefined,
      materials: details?.materials,
      care: details?.care,
      deliveryInstructions: details?.deliveryInstructions,
      tags,
      badge: kind === 'pack' ? 'Pack de flores' : undefined,
    };
  }

  private mapCategory(response: CategoryResponse): ProductCategory {
    return {
      id: response.id,
      name: response.nombre,
      description: response.descripcion ?? '',
    };
  }

  private mapDetails(response: TechnicalDetailsResponse): ProductTechnicalDetails {
    return {
      productId: response.productoId,
      durationDays: response.duracionDias,
      materials: response.materiales ?? '',
      occasion: response.ocasion ?? '',
      care: response.cuidados ?? '',
      deliveryInstructions: response.instruccionesEntrega ?? '',
    };
  }
}
