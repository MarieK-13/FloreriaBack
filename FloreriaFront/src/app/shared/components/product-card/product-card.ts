import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { UiButton } from '../ui-button/ui-button';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, UiButton],
  template: `
    <article class="card" [class.card--horizontal]="horizontal()">
      <button
        type="button"
        class="photo-btn"
        (click)="openModal()"
        [attr.aria-label]="'Ver detalle de ' + product().name"
      >
        <div
          class="photo"
          [class.photo--has-image]="!!product().imageUrl"
          [style.backgroundImage]="product().imageUrl ? 'url(' + product().imageUrl + ')' : null"
        >
          @if (!product().imageUrl) {
            <span class="photo-placeholder" aria-hidden="true">✿</span>
          }
          @if (!product().available) {
            <span class="badge badge--availability">Agotado</span>
          }
          @if (product().badge) {
            <span class="badge badge--new">{{ product().badge }}</span>
          }
        </div>
      </button>

      <div class="details">
        <p class="category">{{ product().category }}</p>
        <h3>{{ product().name }}</h3>

        <p class="description">{{ product().description }}</p>

        <button type="button" class="more-link" (click)="openModal()">Ver detalle</button>

        <ul class="tags">
          @for (tag of product().tags; track tag) {
            <li>{{ tag }}</li>
          }
        </ul>

        <div class="purchase-row">
          <strong class="price">{{ product().price | currency: 'PEN' : 'S/ ' }}</strong>
          <app-ui-button [disabled]="!product().available" (click)="add.emit(product())">
            Añadir
          </app-ui-button>
        </div>
      </div>
    </article>

    @if (isModalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div
          class="modal-box"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title-' + product().id"
          (click)="$event.stopPropagation()"
        >
          <button type="button" class="modal-close" aria-label="Cerrar" (click)="closeModal()">
            ✕
          </button>

          <div class="modal-grid">

            <div
              class="modal-photo"
              [style.backgroundImage]="
                product().imageUrl ? 'url(' + product().imageUrl + ')' : null
              "
            >
              @if (!product().imageUrl) {
                <span class="photo-placeholder" aria-hidden="true">✿</span>
              }
              @if (product().badge) {
                <span class="modal-badge">{{ product().badge }}</span>
              }

              <button
                type="button"
                class="fav-btn"
                [class.fav-btn--active]="isFavorite()"
                [attr.aria-pressed]="isFavorite()"
                aria-label="Guardar en favoritos"
                (click)="toggleFavorite()"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </button>
            </div>

            <div class="modal-info">
              <p class="modal-kicker">{{ product().category }}</p>
              <h2 [id]="'modal-title-' + product().id">{{ product().name }}</h2>

              @if (product().description) {
                <p class="modal-subtitle">{{ product().description }}</p>
              }

              @if (product().components?.length) {
                <div class="description-card">
                  <ul class="breakdown-list">
                    @for (item of product().components; track item.description) {
                      <li>
                        <span class="item-qty">{{ item.quantity }}</span>
                        <span class="item-desc">{{ item.description }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }

              @if (product().size || product().validUntil) {
                <div class="breakdown-meta">
                  <span class="meta-left">
                    @if (product().size) {
                      Tamaño: <span class="meta-pill">{{ product().size }}</span>
                    }
                  </span>
                  <span class="meta-right">
                    @if (product().validUntil) {
                      Válido hasta:
                      <span class="meta-pill meta-pill--rose">{{ product().validUntil }}</span>
                    }
                  </span>
                </div>
              }

              @if (product().care) {
                <p class="modal-care"><strong>Cuidados:</strong> {{ product().care }}</p>
              }

              <div class="modal-footer">
                <app-ui-button
                  variant="outline"
                  [disabled]="!product().available"
                  (click)="add.emit(product()); closeModal()"
                >
                  {{ product().available ? 'Añadir al carrito' : 'Agotado' }}
                </app-ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly add = output<Product>();
  readonly favorite = output<Product>();

  protected readonly isModalOpen = signal(false);
  protected readonly isFavorite = signal(false);
  readonly horizontal = input(false);

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected toggleFavorite(): void {
    this.isFavorite.update((val) => !val);
    this.favorite.emit(this.product());
  }
}
