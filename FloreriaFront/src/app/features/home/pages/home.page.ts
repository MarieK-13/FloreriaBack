import { Component, signal } from '@angular/core';
import { ProductCard, ProductCardData } from '../../../shared/components/product-card/product-card';
import { SectionHeading } from '../../../shared/components/section-heading/section-heading';
import { UiButton } from '../../../shared/components/ui-button/ui-button';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard, SectionHeading, UiButton],
  template: `
    <section class="hero page-width" aria-labelledby="hero-title">
      <div class="hero-copy">
        <span class="eyebrow-pill">Especial para cada ocasión</span>
        <h1 id="hero-title">Flores que cuentan <em>tu historia</em></h1>
        <p>
          Elige de nuestro catálogo o cuéntale a nuestro asistente qué necesitas y recibe tu
          cotización al instante.
        </p>
        <div class="hero-actions">
          <a class="button-link" href="#catalogo">Ver catálogo</a>
          <a class="button-link button-link--outline" href="#cotizador">Cotiza tu arreglo</a>
        </div>
      </div>
      <div class="hero-art" role="img" aria-label="Arreglo floral de temporada">
        <span class="delivery-note">Entrega hoy</span>
        <span class="hero-flower" aria-hidden="true">✿</span>
        <span class="occasion-note"><strong>Tu aniversario es en 7 días</strong><br />Mira arreglos para esa fecha</span>
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
          <a class="occasion-card" href="#catalogo">
            <span class="occasion-icon" aria-hidden="true">{{ occasion.icon }}</span>
            <strong>{{ occasion.name }}</strong>
            <small>{{ occasion.detail }}</small>
          </a>
        }
      </div>
    </section>

    <section class="products-section page-width" id="catalogo" aria-labelledby="products-title">
      <app-section-heading
        headingId="products-title"
        eyebrow="Hechos con cariño"
        title="Nuestros favoritos"
        subtitle="Arreglos frescos para regalar o alegrar tu espacio."
      />
      <div class="product-grid">
        @for (product of products; track product.id) {
          <app-product-card [product]="product" (add)="onAddProduct($event)" />
        }
      </div>
      <p class="cart-message" aria-live="polite">{{ cartMessage() }}</p>
      <div class="catalog-action">
        <app-ui-button variant="outline">Explorar catálogo</app-ui-button>
      </div>
    </section>
  `,
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly cartMessage = signal('');

  protected readonly occasions = [
    { name: 'Aniversario', detail: 'Todo el año', icon: '✿' },
    { name: 'Cumpleaños', detail: 'Todo el año', icon: '❀' },
    { name: 'Día de la Madre', detail: 'Mayo', icon: '❋' },
    { name: 'Día del Padre', detail: 'Junio', icon: '✿' },
    { name: 'Navidad', detail: 'Diciembre', icon: '❀' },
  ];

  protected readonly products: ProductCardData[] = [
    {
      id: 'ramo-rosas',
      name: 'Ramo de 12 Rosas Rojas',
      category: 'Rosas',
      description: 'Un clásico para decir lo que sientes.',
      price: 65,
      tags: ['Rojo', 'Mediano', 'Aniversario'],
      availability: 'Quedan 4',
    },
    {
      id: 'caja-girasoles',
      name: 'Caja Radiante de Girasoles',
      category: 'Girasoles',
      description: 'Un detalle lleno de luz y alegría.',
      price: 78,
      tags: ['Amarillo', 'Grande', 'Cumpleaños'],
    },
    {
      id: 'ramo-mixto',
      name: 'Ramo de Temporada',
      category: 'Arreglos florales',
      description: 'Flores frescas elegidas para sorprender.',
      price: 85,
      tags: ['Colorido', 'Mediano', 'Regalo'],
      badge: 'Nuevo',
    },
    {
      id: 'caja-premium',
      name: 'Caja Premium de Rosas',
      category: 'Rosas',
      description: 'Un arreglo especial para grandes momentos.',
      price: 95,
      tags: ['Rosado', 'Grande', 'Aniversario'],
    },
  ];

  protected onAddProduct(productId: string): void {
    const product = this.products.find(({ id }) => id === productId);

    if (!product) {
      throw new Error(`No se encontró el producto "${productId}" en el catálogo destacado.`);
    }

    this.cartMessage.set(`${product.name} se añadió al carrito.`);
  }
}
