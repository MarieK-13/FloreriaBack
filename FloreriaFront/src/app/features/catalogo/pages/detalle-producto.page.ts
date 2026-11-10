import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { UiButton } from '../../../shared/components/ui-button/ui-button';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-detalle-producto-page',
  imports: [CurrencyPipe, ProductCard, RouterLink, UiButton],
  template: `
    <div class="detail-page page-width">
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a routerLink="/">Inicio</a>
        <span aria-hidden="true">/</span>
        <a routerLink="/catalogo">Catálogo</a>
        <span aria-hidden="true">/</span>
        <strong>{{ product()?.name || 'Detalle' }}</strong>
      </nav>

      @if (isLoading()) {
        <p class="state-message" role="status">Cargando detalle del producto...</p>
      } @else if (loadError()) {
        <div class="state-message state-message--error" role="alert">
          <p>{{ loadError() }}</p>
          <app-ui-button variant="outline" (click)="loadProduct()">Volver a intentar</app-ui-button>
        </div>
      } @else if (product(); as item) {
        <section class="product-detail" aria-labelledby="product-name">
          <div
            class="product-photo"
            [style.background-image]="item.imageUrl ? 'url(' + item.imageUrl + ')' : null"
            role="img"
            [attr.aria-label]="item.imageUrl ? item.name : 'Imagen referencial de ' + item.name"
          >
            @if (!item.imageUrl) {
              <span aria-hidden="true">✿</span>
            }
          </div>

          <div class="product-info">
            <p class="eyebrow">{{ item.kind === 'pack' ? 'Pack de flores' : item.category }}</p>
            <p class="availability" [class.availability--out]="!item.available">
              {{ item.available ? 'Disponible · quedan ' + item.stock + ' unidades' : 'No disponible' }}
            </p>
            <h1 id="product-name">{{ item.name }}</h1>
            <p class="price">{{ item.price | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}</p>
            <p class="description">{{ item.description }}</p>

            <dl class="specifications">
              <div>
                <dt>Color</dt>
                <dd>{{ item.color || 'No especificado' }}</dd>
              </div>
              <div>
                <dt>Número de flores</dt>
                <dd>Ver descripción del arreglo</dd>
              </div>
              <div>
                <dt>Tamaño</dt>
                <dd>{{ item.size || 'No especificado' }}</dd>
              </div>
              <div>
                <dt>Materiales</dt>
                <dd>{{ item.materials || 'No especificados' }}</dd>
              </div>
              <div>
                <dt>Ocasión</dt>
                <dd>{{ item.occasion || 'No especificada' }}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>{{ item.durationDays ? item.durationDays + ' días' : 'No especificada' }}</dd>
              </div>
            </dl>

            @if (item.care || item.deliveryInstructions) {
              <div class="care-details">
                @if (item.care) {
                  <section>
                    <h2>Cuidados</h2>
                    <p>{{ item.care }}</p>
                  </section>
                }
                @if (item.deliveryInstructions) {
                  <section>
                    <h2>Entrega</h2>
                    <p>{{ item.deliveryInstructions }}</p>
                  </section>
                }
              </div>
            }

            <div class="quantity-control">
              <span>Cantidad</span>
              <div class="quantity-stepper" aria-label="Cantidad">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  [disabled]="quantity() <= 1"
                  (click)="changeQuantity(-1)"
                >
                  −
                </button>
                <output>{{ quantity() }}</output>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  [disabled]="quantity() >= item.stock"
                  (click)="changeQuantity(1)"
                >
                  +
                </button>
              </div>
            </div>

            <app-ui-button
              class="add-button"
              [disabled]="!item.available"
              (click)="addToCart(item)"
            >
              Añadir al carrito
            </app-ui-button>
            <p class="cart-message" aria-live="polite">{{ cartMessage() }}</p>
          </div>
        </section>

        @if (item.occasion || item.care) {
          <section class="care-callout">
            <span class="care-icon" aria-hidden="true">✿</span>
            <div>
              <h2>Un detalle que dura</h2>
              <p>
                {{ item.care || 'Consulta las recomendaciones de cuidado al recibir tu arreglo.' }}
              </p>
            </div>
          </section>
        }

        @if (relatedProducts().length > 0) {
          <section class="related-products" aria-labelledby="related-title">
            <header>
              <p class="eyebrow">Más arreglos para ti</p>
              <h2 id="related-title">También podría gustarte</h2>
            </header>
            <div class="related-grid">
              @for (related of relatedProducts(); track related.id) {
                <app-product-card [product]="related" (add)="addRelatedToCart($event)" />
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styleUrl: './detalle-producto.page.scss',
})
export class DetalleProductoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);

  protected readonly product = signal<Product | null>(null);
  protected readonly relatedProducts = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly quantity = signal(1);
  protected readonly cartMessage = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.fetchProduct(params.get('id'));
    });
  }

  protected loadProduct(): void {
    this.fetchProduct(this.route.snapshot.paramMap.get('id'));
  }

  private fetchProduct(productId: string | null): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.product.set(null);
    this.relatedProducts.set([]);

    if (!productId) {
      this.loadError.set('No se indicó qué producto mostrar.');
      this.isLoading.set(false);
      return;
    }

    this.catalogService.getCatalog().subscribe({
      next: (catalog) => {
        const foundProduct = catalog.products.find((item) => item.id === productId);
        if (!foundProduct) {
          this.loadError.set('No encontramos este producto en el catálogo.');
          this.isLoading.set(false);
          return;
        }

        this.product.set(foundProduct);
        this.relatedProducts.set(
          catalog.products
            .filter(
              (item) =>
                item.id !== foundProduct.id &&
                (item.categoryId === foundProduct.categoryId || item.kind === foundProduct.kind),
            )
            .slice(0, 4),
        );
        this.quantity.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el producto. Verifica la conexión con el catálogo.');
        this.isLoading.set(false);
      },
    });
  }

  protected changeQuantity(change: number): void {
    const item = this.product();
    if (!item) {
      return;
    }
    this.quantity.update((current) => Math.min(Math.max(1, current + change), item.stock));
  }

  protected addToCart(item: Product): void {
    this.cartService.addProduct(item, this.quantity());
    this.cartMessage.set(`${this.quantity()} × ${item.name} se añadió al carrito.`);
  }

  protected addRelatedToCart(item: Product): void {
    this.cartService.addProduct(item);
    this.cartMessage.set(`${item.name} se añadió al carrito.`);
  }
}
