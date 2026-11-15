import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritosService } from '../services/favoritos.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-favoritos-page',
  imports: [RouterLink, ProductCard],
  template: `
    <div class="fav-page full-bounds">
      <header class="fav-header">
        <div>
          <span class="eyebrow-tag">TU COLECCIÓN FLORAL</span>
          <h1>Mis arreglos favoritos</h1>
        </div>

        <div class="header-actions">
          @if (!favoritosService.estaLogueado() && productosMostrados().length > 0) {
            <a
              routerLink="/ingresar"
              [queryParams]="{ redirect: '/favoritos' }"
              class="btn-brand-pill"
            >
              Inicia sesión para guardarlos en tu cuenta
            </a>
          }

          @if (productosMostrados().length > 0) {
            <button type="button" class="btn-outline-pill" (click)="vaciarLista()">
              Vaciar lista ({{ productosMostrados().length }})
            </button>
          }
        </div>
      </header>

      @if (!favoritosService.estaLogueado() && productosMostrados().length > 0) {
        <div class="guest-banner">
          ✿ Estás viendo tus favoritos guardados en este navegador. Inicia sesión para
          sincronizarlos con tu cuenta y no perderlos.
        </div>
      }

      @if (cargando()) {
        <div class="empty-state">Cargando tus arreglos favoritos...</div>
      } @else if (productosMostrados().length === 0) {
        <section class="empty-state">
          <div class="empty-heart" aria-hidden="true">♡</div>
          <h2>Aún no tienes favoritos guardados</h2>
          <p>
            Explora nuestro catálogo, abre el detalle de cualquier arreglo y toca el corazón para
            guardarlo aquí.
          </p>
          <a routerLink="/catalogo" class="btn-brand-pill">Explorar catálogo floral</a>
        </section>
      } @else {
        <div class="fav-grid">
          @for (prod of productosMostrados(); track prod.id) {
            <app-product-card [product]="prod" />
          }
        </div>
      }
    </div>
  `,
  styleUrl: './favoritos.page.scss',
})
export class FavoritosPage implements OnInit {
  protected readonly favoritosService = inject(FavoritosService);

  private readonly productosBackend = signal<Product[]>([]);
  protected readonly cargando = signal<boolean>(true);

  protected readonly productosMostrados = computed(() => {
    const idsActivos = this.favoritosService.idsFavoritos();

    if (this.favoritosService.estaLogueado()) {
      return this.productosBackend().filter((p) => idsActivos.includes(p.id));
    }

    return this.favoritosService.productosLocales().filter((p) => idsActivos.includes(p.id));
  });

  ngOnInit(): void {
    if (this.favoritosService.estaLogueado()) {
      this.favoritosService.obtenerProductosFavoritosBackend().subscribe({
        next: (lista) => {
          this.productosBackend.set(lista.map((dto) => this.mapearDtoAProduct(dto)));
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
    } else {
      this.cargando.set(false);
    }
  }

  private mapearDtoAProduct(raw: any): Product {
    return {
      ...raw,
      id: raw.id,
      name: raw.name ?? raw.nombre ?? 'Arreglo Floral',
      description: raw.description ?? raw.descripcion ?? '',
      price: raw.price ?? raw.precio ?? 0,
      imageUrl: raw.imageUrl ?? raw.imagenUrl ?? '',
      category: raw.category ?? raw.categoria?.nombre ?? raw.categoriaNombre ?? 'Arreglos',
      available: raw.available ?? raw.disponible ?? true,
      tags: raw.tags ?? [],
    } as Product;
  }

  protected vaciarLista(): void {
    this.favoritosService.vaciarFavoritos().subscribe(() => {
      this.productosBackend.set([]);
    });
  }
}
