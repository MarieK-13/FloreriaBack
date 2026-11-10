import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { UiButton } from '../ui-button/ui-button';

export interface ProductCardData {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  tags: string[];
  imageUrl?: string;
  badge?: string;
  availability?: string;
}

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, UiButton],
  template: `
    <article class="card">
      <a class="product-link" href="/#catalogo" [attr.aria-label]="'Ver ' + product().name">
        <div
          class="photo"
          [class.photo--has-image]="product().imageUrl"
          [style.background-image]="product().imageUrl ? 'url(' + product().imageUrl + ')' : null"
          role="img"
          [attr.aria-label]="product().imageUrl ? product().name : 'Imagen referencial de ' + product().name"
        >
          @if (!product().imageUrl) {
            <span class="photo-placeholder" aria-hidden="true">✿</span>
          }
          @if (product().availability) {
            <span class="badge badge--availability">{{ product().availability }}</span>
          }
          @if (product().badge) {
            <span class="badge badge--new">{{ product().badge }}</span>
          }
        </div>
      </a>

      <div class="details">
        <p class="category">{{ product().category }}</p>
        <h3><a href="/#catalogo">{{ product().name }}</a></h3>
        <p class="description">{{ product().description }}</p>
        <ul class="tags" aria-label="Características">
          @for (tag of product().tags; track tag) {
            <li>{{ tag }}</li>
          }
        </ul>
        <div class="purchase-row">
          <strong class="price">{{ product().price | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}</strong>
          <app-ui-button variant="outline" (click)="addToCart()">Añadir</app-ui-button>
        </div>
      </div>
    </article>
  `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<ProductCardData>();
  readonly add = output<string>();

  protected addToCart(): void {
    this.add.emit(this.product().id);
  }
}
