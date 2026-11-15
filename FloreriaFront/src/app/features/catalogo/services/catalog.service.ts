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
  imagenesGaleria?: string[];
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

export interface DetalleProductoResponse {
  id: string;
  productoId: string;
  productoNombre: string;
  cuidados?: string;
  duracionDias?: number;
  materiales?: string;
  ocasion?: string;
  instruccionesEntrega?: string;
}

const FALLBACK_CATALOG: StoreCatalog = {
  categories: [
    { id: 'cat-ramos', name: 'Ramos', description: 'Ramos frescos armados a mano' },
    { id: 'cat-box', name: 'Box', description: 'Cajas florales de lujo' },
    { id: 'cat-arreglos', name: 'Arreglos', description: 'Centros de mesa y bases' },
    { id: 'cat-plantas', name: 'Plantas', description: 'Plantas ornamentales vivas' },
  ],
  products: [
    // ✅ CASO 1: 4 FOTOS
    {
      id: '101',
      categoryId: 'cat-box',
      category: 'Box',
      kind: 'pack',
      name: 'Box Romántico 24 Rosas Rojas',
      description: 'Arreglo exclusivo en caja cilíndrica de lujo ideal para celebrar el amor.',
      price: 145,
      stock: 8,
      available: true,
      color: 'Rojo',
      size: 'Grande',
      occasion: 'Aniversario, San Valentín, Amor',
      tags: ['Rojo', 'Grande', 'Aniversario'],
      badge: 'Pack de flores',
      validUntil: '2026-11-30',
      durationDays: 8,
      materials: 'Caja cilíndrica rígida, esponja floral oasis y lazo de seda',
      deliveryInstructions: 'Entrega en caja protectora con tarjeta dedicatoria sellada.',
      care: 'Mantener en lugar fresco y humedecer la espuma floral cada 2 días.',
      components: [
        { quantity: 24, description: 'rosas rojas frescas' },
        { quantity: 1, description: 'caja cilíndrica de lujo' },
        { quantity: 1, description: 'tarjeta dedicatoria personalizada' },
        { quantity: 1, description: 'lazo de seda decorativo' },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // ✅ CASO 2: 3 FOTOS
    {
      id: '103',
      categoryId: 'cat-box',
      category: 'Box',
      kind: 'pack',
      name: 'Pack Dulce Mamá (Tulipanes + Chocolates)',
      description: 'Combo exclusivo con selección de tulipanes importados y bombones artesanales.',
      price: 130,
      stock: 5,
      available: true,
      color: 'Pastel',
      size: 'Grande',
      occasion: 'Día de la Madre, Cumpleaños, Aniversario',
      tags: ['Pastel', 'Grande', 'Día de la Madre'],
      badge: 'Pack de flores',
      validUntil: '2026-12-15',
      durationDays: 7,
      materials: 'Papel coreano impermeable, caja rígida y cinta satinada',
      deliveryInstructions: 'Transportar en posición vertical y mantener en ambiente fresco.',
      care: 'Conservar lejos de la luz solar directa y en ambiente fresco.',
      components: [
        { quantity: 12, description: 'tulipanes rosados importados' },
        { quantity: 1, description: 'caja de bombones artesanales' },
        { quantity: 1, description: 'tarjeta personalizada' },
        { quantity: 1, description: 'envoltura coreana premium' },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // ✅ CASO 3: 2 FOTOS
    {
      id: '104',
      categoryId: 'cat-arreglos',
      category: 'Arreglos',
      kind: 'pack',
      name: 'Centro de Mesa Nochebuena',
      description: 'Diseño festivo con rosas de exportación, follaje natural y vela aromática.',
      price: 120,
      stock: 6,
      available: true,
      color: 'Rojo',
      size: 'Mediano',
      occasion: 'Navidad',
      tags: ['Rojo', 'Mediano', 'Navidad'],
      badge: 'Pack de flores',
      validUntil: '2026-12-25',
      durationDays: 10,
      materials: 'Base de madera rústica tratada y esponja floral hidratada',
      deliveryInstructions: 'Ideal para colocar directo en mesa principal.',
      care: 'Agregar medio vaso de agua fría en el centro de la base cada 2 días.',
      components: [
        { quantity: 8, description: 'rosas rojas de exportación' },
        { quantity: 4, description: 'ramas de pino natural y piñas' },
        { quantity: 1, description: 'vela aromática navideña' },
        { quantity: 1, description: 'base de madera rústica' },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // ✅ CASO 4: 1 SOLA FOTO (sin miniaturas)
    {
      id: '102',
      categoryId: 'cat-ramos',
      category: 'Ramos',
      kind: 'product',
      name: 'Ramo Amanecer de Girasoles',
      description: '10 girasoles radiantes envueltos en papel coreano impermeable con follaje fresco.',
      price: 85,
      stock: 12,
      available: true,
      color: 'Amarillo',
      size: 'Mediano',
      occasion: 'Cumpleaños, Graduación, Amistad',
      tags: ['Amarillo', 'Mediano', 'Cumpleaños'],
      durationDays: 7,
      materials: 'Papel coreano impermeable y cinta de organza',
      care: 'Cortar 1 cm de los tallos en diagonal y cambiar el agua cada 2 días.',
      imageUrl:
        'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '105',
      categoryId: 'cat-ramos',
      category: 'Ramos',
      kind: 'product',
      name: 'Ramo Jardín de Peonías y Rosas',
      description: 'Ramo artesanal en tonos rosados suaves ideal para regalar en cualquier ocasión.',
      price: 110,
      stock: 9,
      available: true,
      color: 'Rosado',
      size: 'Mediano',
      occasion: 'Cumpleaños, Amor, Aniversario',
      tags: ['Rosado', 'Mediano', 'Cumpleaños'],
      durationDays: 6,
      materials: 'Papel seda doble capa y lazo satinado',
      care: 'Mantener en florero limpio con agua fresca lejos del calor.',
      imageUrl:
        'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '106',
      categoryId: 'cat-arreglos',
      category: 'Arreglos',
      kind: 'product',
      name: 'Arreglo Paz y Serenidad',
      description: 'Composición elegante de liliums blancos y rosas crema en base cerámica.',
      price: 95,
      stock: 7,
      available: true,
      color: 'Blanco',
      size: 'Mediano',
      occasion: 'Condolencias, Agradecimiento',
      tags: ['Blanco', 'Mediano', 'Condolencias'],
      durationDays: 8,
      materials: 'Base cerámica esmaltada y esponja floral',
      care: 'Humedecer ligeramente la esponja floral cada 48 horas.',
      imageUrl:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '107',
      categoryId: 'cat-plantas',
      category: 'Plantas',
      kind: 'product',
      name: 'Mini Orquídea Phalaenopsis',
      description: 'Planta viva de larga duración en maceta minimalista decorativa.',
      price: 75,
      stock: 15,
      available: true,
      color: 'Blanco',
      size: 'Pequeño',
      occasion: 'Agradecimiento, Cumpleaños, Oficina',
      tags: ['Blanco', 'Pequeño', 'Agradecimiento'],
      durationDays: 45,
      materials: 'Maceta cerámica minimalista y sustrato de corteza',
      care: 'Regar con 3 cucharadas de agua una vez por semana sin encharcar.',
      imageUrl:
        'https://images.unsplash.com/photo-1566907225472-514215c9e5cd?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

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
      catchError(() => of(FALLBACK_CATALOG)),
    );
  }

  getProductById(id: string): Observable<Product> {
    return forkJoin({
      product: this.http.get<ProductResponse>(`${API_BASE_URL}/productos/${id}`),
      technicalDetails: this.http
        .get<TechnicalDetailsResponse>(`${API_BASE_URL}/detalle-productos/producto/${id}`)
        .pipe(catchError(() => of(null))),
    }).pipe(
      map(({ product, technicalDetails }) =>
        this.mapProduct(
          product,
          technicalDetails ? this.mapDetails(technicalDetails) : undefined,
        ),
      ),
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

    const galleryImages = Array.from(
      new Set([response.imagenUrl, ...(response.imagenesGaleria ?? [])].filter(Boolean) as string[]),
    );

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
      galleryImages,
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
