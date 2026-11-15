import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { CarritoService } from '../../carrito/services/carrito.service';
import { FavoritosService } from '../../favoritos/services/favoritos.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-detalle-producto-page',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="boutique-detail-page page-width">
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a routerLink="/">Inicio</a>
        <span class="sep">·</span>
        <a routerLink="/catalogo">Catálogo</a>
        @if (product()?.category) {
          <span class="sep">·</span>
          <a routerLink="/catalogo">{{ product()!.category }}</a>
        }
        <span class="sep">·</span>
        <strong>{{ product()?.name || 'Detalle' }}</strong>
      </nav>

      @if (isLoading()) {
        <div class="boutique-card skeleton-layout" role="status" aria-label="Cargando arreglo">
          <div class="skeleton-media"></div>
          <div class="skeleton-content">
            <div class="sk-line w-30"></div>
            <div class="sk-line w-80 h-lg"></div>
            <div class="sk-line w-35 h-md"></div>
            <div class="sk-block"></div>
            <div class="sk-line w-100 h-btn"></div>
          </div>
        </div>
      } @else if (loadError()) {
        <div class="state-box" role="alert">
          <span class="floral-mark" aria-hidden="true">✿</span>
          <p>{{ loadError() }}</p>
          <button type="button" class="btn-primary-pill" (click)="loadProduct()">
            Volver a intentar
          </button>
        </div>
      } @else if (product(); as item) {
        <article class="boutique-card detail-animate-in" aria-labelledby="product-name">
          <!-- COLUMNA IZQUIERDA: Galería proporcional + Acordeones -->
          <div class="media-column">
            <div class="gallery-stage" [class.has-thumbs]="gallery().length > 1">
              @if (gallery().length > 1) {
                <div class="thumbs-rail" role="tablist" aria-label="Vistas del arreglo">
                  @for (imgUrl of gallery(); track imgUrl; let i = $index) {
                    <button
                      type="button"
                      class="thumb-tile"
                      [class.is-active]="selectedImage() === imgUrl"
                      (click)="selectImage(imgUrl)"
                      [attr.aria-label]="'Vista ' + (i + 1) + ' de ' + item.name"
                    >
                      <img [src]="imgUrl" [alt]="item.name + ' vista ' + (i + 1)" />
                    </button>
                  }
                </div>
              }

              <div class="hero-frame">
                @if (selectedImage()) {
                  <img [src]="selectedImage()" [alt]="item.name" class="hero-img" />
                } @else {
                  <div class="hero-empty">
                    <span aria-hidden="true">✿</span>
                    <p>{{ item.name }}</p>
                  </div>
                }

                @if (gallery().length > 1) {
                  <span class="photo-counter">
                    {{ activeImageIndex() + 1 }} / {{ gallery().length }}
                  </span>
                }
              </div>
            </div>

            @if (item.care || item.deliveryInstructions || occasionChips().length > 0) {
              <div class="editorial-accordions">
                @if (item.care) {
                  <details class="accordion-item" open>
                    <summary>
                      <span class="acc-title">
                        <span class="acc-icon" aria-hidden="true">✿</span>
                        Cuidados y frescura
                      </span>
                      <span class="acc-chevron" aria-hidden="true"></span>
                    </summary>
                    <p class="acc-body">{{ item.care }}</p>
                  </details>
                }

                @if (item.deliveryInstructions) {
                  <details class="accordion-item" [attr.open]="!item.care ? '' : null">
                    <summary>
                      <span class="acc-title">
                        <span class="acc-icon" aria-hidden="true">✦</span>
                        Entrega y presentación
                      </span>
                      <span class="acc-chevron" aria-hidden="true"></span>
                    </summary>
                    <p class="acc-body">{{ item.deliveryInstructions }}</p>
                  </details>
                }

                @if (occasionChips().length > 0) {
                  <details class="accordion-item" open>
                    <summary>
                      <span class="acc-title">
                        <span class="acc-icon" aria-hidden="true">♡</span>
                        Ideal para regalar en
                      </span>
                      <span class="acc-chevron" aria-hidden="true"></span>
                    </summary>
                    <div class="acc-chips">
                      @for (oc of occasionChips(); track oc) {
                        <span class="occasion-tag">{{ oc }}</span>
                      }
                    </div>
                  </details>
                }
              </div>
            }
          </div>

          <!-- COLUMNA DERECHA: Curaduría, detalles reales y compra -->
          <div class="editorial-column">
            <div class="top-meta">
              <span class="kicker">
                {{ item.kind === 'pack' ? 'Edición especial · Pack' : 'Colección · ' + item.category }}
              </span>
              <span class="stock-badge" [class.is-out]="!item.available">
                <span class="dot"></span>
                {{ item.available ? item.stock + ' disponibles' : 'Agotado' }}
              </span>
            </div>

            <h1 id="product-name">{{ item.name }}</h1>

            <!-- Frescura a la izquierda (texto legible) y Precio a la derecha -->
            <div class="price-row" [class.price-only]="!item.durationDays">
              @if (item.durationDays) {
                <span class="freshness-note">
                  Frescura estimada: <strong>{{ item.durationDays }} días</strong>
                </span>
              }
              <p class="price">{{ item.price | currency: 'PEN' : 'S/ ' : '1.2-2' }}</p>
            </div>

            @if (item.description) {
              <p class="lead-description">{{ item.description }}</p>
            }

            <div class="divider-floral" aria-hidden="true">
              <span></span><i>✿</i><span></span>
            </div>

            <!-- Lista limpia de atributos (Color: ..., Tamaño: ..., etc.) -->
            @if (item.color || item.size || item.materials || item.validUntil) {
              <ul class="specs-list">
                @if (item.color) {
                  <li>
                    <span class="spec-key">Color:</span>
                    <span class="spec-val">{{ item.color }}</span>
                  </li>
                }
                @if (item.size) {
                  <li>
                    <span class="spec-key">Tamaño:</span>
                    <span class="spec-val">{{ item.size }}</span>
                  </li>
                }
                @if (item.materials) {
                  <li>
                    <span class="spec-key">Materiales:</span>
                    <span class="spec-val">{{ item.materials }}</span>
                  </li>
                }
                @if (item.validUntil) {
                  <li>
                    <span class="spec-key">Disponible hasta:</span>
                    <span class="spec-val">{{ item.validUntil }}</span>
                  </li>
                }
              </ul>
            }

            <!-- Composición del arreglo con estructura anterior + fondo y título rosa -->
            @if (item.components && item.components.length > 0) {
              <div class="curated-box">
                <h3 class="curated-title">Composición del arreglo</h3>
                <ul class="curated-list">
                  @for (comp of item.components; track comp.description) {
                    <li>
                      <strong>{{ comp.quantity }}</strong>
                      <span>{{ comp.description }}</span>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Zona de compra -->
            <div class="purchase-panel">
              <div class="controls-bar">
                <div class="qty-box" aria-label="Cantidad">
                  <button
                    type="button"
                    aria-label="Disminuir cantidad"
                    [disabled]="quantity() <= 1"
                    (click)="changeQuantity(-1)"
                  >
                    −
                  </button>
                  <span>{{ quantity() }}</span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    [disabled]="!item.available || quantity() >= item.stock"
                    (click)="changeQuantity(1)"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  class="btn-primary-pill"
                  [disabled]="!item.available"
                  (click)="addToCart(item)"
                >
                  <span>Añadir al carrito</span>
                  <span class="btn-sep">·</span>
                  <span>{{ item.price * quantity() | currency: 'PEN' : 'S/ ' : '1.2-2' }}</span>
                </button>

                <button
                  type="button"
                  class="btn-fav-circle"
                  [class.is-active]="isFavorite()"
                  (click)="toggleFavorite(item)"
                  [attr.aria-label]="isFavorite() ? 'Quitar de favoritos' : 'Guardar en favoritos'"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    [attr.fill]="isFavorite() ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                    />
                  </svg>
                </button>
              </div>

              <div class="back-link-wrap">
                <a routerLink="/catalogo" class="back-link">← Seguir explorando el catálogo</a>
              </div>
            </div>
          </div>
        </article>
      }
    </section>
  `,
  styleUrl: './detalle-producto.page.scss',
})
export class DetalleProductoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly carritoService = inject(CarritoService);
  protected readonly favoritosService = inject(FavoritosService);

  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly quantity = signal(1);
  protected readonly selectedImage = signal<string>('');

  protected readonly gallery = computed(() => {
    const item = this.product();
    if (!item) return [];
    if (item.galleryImages && item.galleryImages.length > 0) {
      return item.galleryImages.slice(0, 4);
    }
    return item.imageUrl ? [item.imageUrl] : [];
  });

  protected readonly activeImageIndex = computed(() => {
    const idx = this.gallery().indexOf(this.selectedImage());
    return idx >= 0 ? idx : 0;
  });

  protected readonly isFavorite = computed(() => {
    const item = this.product();
    return item ? this.favoritosService.esFavorito(item.id) : false;
  });

  protected readonly occasionChips = computed(() => {
    const raw = this.product()?.occasion;
    if (!raw) return [];
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.fetchProduct(params.get('id'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  protected loadProduct(): void {
    this.fetchProduct(this.route.snapshot.paramMap.get('id'));
  }

  private fetchProduct(productId: string | null): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.product.set(null);

    if (!productId) {
      this.loadError.set('No se indicó qué producto mostrar.');
      this.isLoading.set(false);
      return;
    }

    this.catalogService.getCatalog().subscribe({
      next: (catalog) => {
        const foundProduct = catalog.products.find((item) => item.id === productId);
        if (!foundProduct) {
          this.loadError.set('No encontramos este arreglo en el catálogo.');
          this.isLoading.set(false);
          return;
        }

        this.product.set(foundProduct);
        this.selectedImage.set(foundProduct.galleryImages?.[0] ?? foundProduct.imageUrl ?? '');
        this.quantity.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el detalle del producto.');
        this.isLoading.set(false);
      },
    });
  }

  protected selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  protected changeQuantity(change: number): void {
    const item = this.product();
    if (!item) return;
    this.quantity.update((current) => Math.min(Math.max(1, current + change), item.stock));
  }

  protected addToCart(item: Product): void {
    this.carritoService.agregarProducto(item, this.quantity());
  }

  protected toggleFavorite(item: Product): void {
    this.favoritosService.toggleFavorito(item.id, item);
  }
}
