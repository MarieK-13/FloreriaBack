import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { BannerService } from '../../../core/services/banner.service';
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
    <div class="hero-wrapper page-width">
      <button
        type="button"
        class="carousel-arrow carousel-arrow--prev"
        (click)="prevSlide()"
        aria-label="Anterior"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <section class="hero" aria-labelledby="hero-title">
        @let slide = slides()[currentSlide()];

        @if (slide.tipo === 'fijo') {
          <div class="hero-copy">
            <span class="eyebrow-pill">Especial de Aniversario</span>
            <h1 id="hero-title">Flores que cuentan <em>tu historia</em></h1>
            <p>
              Elige de nuestro catálogo o cuéntale a nuestro asistente qué necesitas y recibe tu
              cotización al instante.
            </p>
            <div class="hero-actions">
              <app-ui-button routerLink="/catalogo">Ver catálogo</app-ui-button>
              <app-ui-button variant="outline" routerLink="/" fragment="cotizador">
                Cotiza tu arreglo
              </app-ui-button>
            </div>

            <div class="carousel-dots">
              @for (item of slides(); track $index) {
                <button
                  type="button"
                  class="dot"
                  [class.active]="currentSlide() === $index"
                  (click)="currentSlide.set($index)"
                  [attr.aria-label]="'Ir a diapositiva ' + ($index + 1)"
                ></button>
              }
            </div>
          </div>

          <div class="hero-art-wrap">
            <div class="hero-art" role="img" aria-label="Arreglo floral de temporada">
              <span class="hero-flower" aria-hidden="true">✿</span>
            </div>
            <span class="delivery-note">Entrega hoy</span>
            <span class="occasion-note">
              <strong>Tu aniversario es en 7 días</strong>
              <small>Mira arreglos para esa fecha</small>
            </span>
          </div>
        } @else {
          <a class="hero-banner-full" [routerLink]="slide.enlaceDestino">
            <img [src]="slide.imagenUrl" [alt]="slide.titulo" class="hero-banner-img" />
          </a>
        }
      </section>

      <button
        type="button"
        class="carousel-arrow carousel-arrow--next"
        (click)="nextSlide()"
        aria-label="Siguiente"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

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

      <div class="occasion-marquee">
        <div class="occasion-track">
          @for (occasion of infiniteOccasions(); track $index) {
            <a
              class="occasion-card"
              routerLink="/catalogo"
              [queryParams]="{ ocasion: occasion.name }"
            >
              <div class="occasion-photo-ring">
                <img [src]="occasion.image" [alt]="occasion.name" class="occasion-photo" />
              </div>
              <strong>{{ occasion.name }}</strong>
              <small>{{ occasion.detail }}</small>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- NOVEDADES: CARRUSEL HORIZONTAL CON FLECHAS -->
    <section class="products-section new-products page-width" aria-labelledby="new-products-title">
      <app-section-heading
        headingId="new-products-title"
        eyebrow="Para regalar"
        title="Novedades"
        subtitle="Packs de flores preparados para regalar."
      />

      @if (newProducts().length === 0) {
        <p class="catalog-state">Pronto encontrarás aquí nuestros packs de novedad.</p>
      } @else {
        <div class="new-carousel-wrapper">
          @if (newProducts().length > 4) {
            <button
              type="button"
              class="carousel-arrow carousel-arrow--prev"
              (click)="scrollNewProducts(-1)"
              aria-label="Ver novedades anteriores"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          }

          <div class="new-carousel-track" #newTrack>
            @for (product of newProducts(); track product.id) {
              <div class="new-carousel-item">
                <app-product-card [product]="product" (add)="addToCart($event)" />
              </div>
            }
          </div>

          @if (newProducts().length > 4) {
            <button
              type="button"
              class="carousel-arrow carousel-arrow--next"
              (click)="scrollNewProducts(1)"
              aria-label="Ver más novedades"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          }
        </div>
      }
    </section>

    <app-campaign-panel />

    <!-- PRODUCTOS DESTACADOS: GRILLA ESTÁTICA DE 4 TARJETAS (SIN BOTÓN EXPLORAR CATÁLOGO) -->
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
    </section>
  `,
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly bannerService = inject(BannerService);
  private readonly newTrack = viewChild<ElementRef<HTMLElement>>('newTrack');

  protected readonly currentSlide = signal(0);
  protected readonly slides = computed(() => [
    { tipo: 'fijo' as const },
    ...this.bannerService.bannersActivos().map((b) => ({
      tipo: 'imagen' as const,
      imagenUrl: b.imagenUrl,
      enlaceDestino: b.enlaceDestino,
      titulo: b.titulo,
    })),
  ]);

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly cartMessage = signal('');

  // Novedades: únicamente paquetes o combos (kind === 'pack'), mostrando los más recientes primero
  protected readonly newProducts = computed(() =>
    this.products()
      .filter((product) => product.kind === 'pack')
  );

  // Productos destacados: únicamente productos unitarios (kind === 'product'), máximo 4
  protected readonly featuredProducts = computed(() =>
    this.products()
      .filter((product) => product.kind === 'product')
      .slice(0, 4),
  );

  protected readonly occasions = [
    { name: 'Navidad', detail: 'Diciembre', image: '/images/ocasiones/navidad.jpg' },
    { name: 'San Valentín', detail: 'Febrero', image: '/images/ocasiones/san-valentin.jpg' },
    { name: 'Aniversario', detail: 'Todo el año', image: '/images/ocasiones/aniversario.jpg' },
    { name: 'Cumpleaños', detail: 'Todo el año', image: '/images/ocasiones/cumpleanos.jpg' },
    { name: 'Graduación', detail: 'Todo el año', image: '/images/ocasiones/graduacion.jpg' },
    { name: 'Día de la Madre', detail: 'Mayo', image: '/images/ocasiones/dia-madre.jpg' },
    { name: 'Día del Padre', detail: 'Junio', image: '/images/ocasiones/dia-padre.jpg' },
    { name: 'Amor', detail: 'Todo el año', image: '/images/ocasiones/amor.jpg' },
    { name: 'Condolencias', detail: 'Todo el año', image: '/images/ocasiones/condolencias.jpg' },
    { name: 'Nacimiento', detail: 'Todo el año', image: '/images/ocasiones/nacimiento.jpg' },
  ];

  protected readonly infiniteOccasions = computed(() => [...this.occasions, ...this.occasions]);

  ngOnInit(): void {
    this.loadCatalog();
  }

  protected nextSlide(): void {
    const total = this.slides().length;
    this.currentSlide.update((i) => (i + 1) % total);
  }

  protected prevSlide(): void {
    const total = this.slides().length;
    this.currentSlide.update((i) => (i - 1 + total) % total);
  }

  protected scrollNewProducts(direction: 1 | -1): void {
    const track = this.newTrack()?.nativeElement;
    if (!track) return;
    const step = track.clientWidth * 0.78;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
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
        this.loadError.set(
          'No se pudieron cargar los productos. Verifica la conexión con el catálogo.',
        );
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
