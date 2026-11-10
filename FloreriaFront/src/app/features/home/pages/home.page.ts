import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CatalogService } from '../../catalogo/services/catalog.service';
import { Product } from '../../../shared/models/product.model';
import { CampaignPanel } from '../components/campaign-panel/campaign-panel';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { SectionHeading } from '../../../shared/components/section-heading/section-heading';
import { UiButton } from '../../../shared/components/ui-button/ui-button';

@Component({
  selector: 'app-home-page',
  imports: [CampaignPanel, ProductCard, RouterLink, SectionHeading, UiButton],
  template: `
    <section class="hero page-width" aria-labelledby="hero-title">
      <div class="hero-copy">
        <span class="eyebrow-pill">Especial Día de la Madre</span>
        <h1 id="hero-title">Flores que cuentan <em>tu historia</em></h1>
        <p>
          Elige de nuestro catálogo o cuéntale a nuestro asistente qué necesitas y recibe tu
          cotización al instante.
        </p>
        <div class="hero-actions">
          <a class="button-link" routerLink="/catalogo">Ver catálogo</a>
          <a class="button-link button-link--outline" href="/#cotizador">Cotiza tu arreglo</a>
        </div>
      </div>
      <div class="hero-art" role="img" aria-label="Arreglo floral de temporada">
        <span class="delivery-note">Entrega hoy</span>
        <span class="hero-flower" aria-hidden="true">✿</span>
        <span class="occasion-note">
          <strong>Tu aniversario es en 7 días</strong><br />Mira arreglos para esa fecha
        </span>
      </div>
    </section>

    <section class="benefits page-width" aria-label="Beneficios">
      <article class="benefit">
        <span class="benefit-icon" aria-hidden="true">↗</span>
        <span><strong>Entrega el mismo día</strong><small>En Ica y alrededores</small></span>
      </article>
      <article class="benefit">
        <span class="benefit-icon" aria-hidden="true">▦</span>
        <span><strong>Pedidos programados</strong><small>Elige fecha y hora</small></span>
      </article>
      <article class="benefit">
        <span class="benefit-icon" aria-hidden="true">✿</span>
        <span><strong>Flores frescas</strong><small>Duran de 5 a 10 días</small></span>
      </article>
      <article class="benefit" id="cotizador">
        <span class="benefit-icon" aria-hidden="true">♡</span>
        <span><strong>Asistente de cotización</strong><small>Arma tu arreglo ideal</small></span>
      </article>
    </section>

    <section class="occasions-section page-width" aria-labelledby="occasions-title">
      <app-section-heading
        headingId="occasions-title"
        eyebrow="Pequeños grandes momentos"
        title="Un detalle para cada momento"
        subtitle="Encuentra flores para celebrar cada historia."
      />
      <div class="occasion-grid">
        @for (occasion of occasions; track occasion.name) {
          <a
            class="occasion-card"
            routerLink="/catalogo"
            [queryParams]="{ ocasion: occasion.name }"
          >
            <span class="occasion-icon" aria-hidden="true">{{ occasion.icon }}</span>
            <strong>{{ occasion.name }}</strong>
            <small>{{ occasion.detail }}</small>
          </a>
        }
      </div>
    </section>

    <app-campaign-panel />

    <section class="products-section page-width" aria-labelledby="products-title">
      <app-section-heading
        headingId="products-title"
        eyebrow="Hechos con cariño"
        title="Productos destacados"
        subtitle="Arreglos frescos para regalar o alegrar tu espacio."
      />

      @if (isLoading()) {
        <p class="catalog-state" role="status">Cargando productos...</p>
      } @else if (loadError()) {
        <div class="catalog-state catalog-state--error" role="alert">
          <p>{{ loadError() }}</p>
          <app-ui-button variant="outline" (click)="loadCatalog()">Volver a intentar</app-ui-button>
        </div>
      } @else if (featuredProducts().length === 0) {
        <p class="catalog-state">Pronto encontrarás aquí los arreglos destacados.</p>
      } @else {
        <div class="product-grid">
          @for (product of featuredProducts(); track product.id) {
            <app-product-card [product]="product" (add)="addToCart($event)" />
          }
        </div>
      }

      <p class="cart-message" aria-live="polite">{{ cartMessage() }}</p>
      <div class="catalog-action">
        <app-ui-button variant="outline" routerLink="/catalogo">Explorar catálogo</app-ui-button>
      </div>
    </section>

    @if (newProducts().length > 0) {
      <section class="products-section new-products page-width" aria-labelledby="new-products-title">
        <app-section-heading
          headingId="new-products-title"
          eyebrow="Para regalar"
          title="Novedades"
          subtitle="Packs de flores preparados para regalar."
        />
        <div class="product-grid">
          @for (product of newProducts(); track product.id) {
            <app-product-card [product]="product" (add)="addToCart($event)" />
          }
        </div>
      </section>
    }
  `,
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly cartMessage = signal('');
  protected readonly featuredProducts = computed(() => this.products().slice(0, 4));
  protected readonly newProducts = computed(() =>
    this.products().filter((product) => product.kind === 'pack').slice(0, 3),
  );

  protected readonly occasions = [
    { name: 'Aniversario', detail: 'Todo el año', icon: '✿' },
    { name: 'Cumpleaños', detail: 'Todo el año', icon: '❀' },
    { name: 'Día de la Madre', detail: 'Mayo', icon: '❋' },
    { name: 'Día del Padre', detail: 'Junio', icon: '✿' },
    { name: 'Navidad', detail: 'Diciembre', icon: '❀' },
  ];

  ngOnInit(): void {
    this.loadCatalog();
  }

  protected loadCatalog(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.catalogService.getCatalog().subscribe({
      next: (catalog) => {
        this.products.set(catalog.products);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudieron cargar los productos. Verifica la conexión con el catálogo.');
        this.isLoading.set(false);
      },
    });
  }

  protected addToCart(product: Product): void {
    this.cartService.addProduct(product);
    this.cartMessage.set(
      product.available
        ? `${product.name} se añadió al carrito.`
        : `${product.name} no está disponible.`,
    );
  }
}
