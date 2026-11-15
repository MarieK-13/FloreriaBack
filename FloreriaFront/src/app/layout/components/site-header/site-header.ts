import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-site-header',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="announcement">
      <div class="announcement-inner">
        <span>⌖ &nbsp; Entregas en Ica y alrededores</span>
        <span>Entrega el mismo día · Programa tu pedido cuando quieras</span>
      </div>
    </div>

    <header class="header">
      <div class="header-inner">
        <a class="brand" routerLink="/" aria-label="FloriaSmart, inicio">
          <span class="brand-icon" aria-hidden="true">✿</span>
          <span>FloriaSmart</span>
        </a>
        <nav class="navigation" aria-label="Navegación principal">
          <a routerLink="/">Inicio</a>
          <a routerLink="/catalogo">Catálogo</a>
          <a routerLink="/nosotros">Nosotros</a>
          <a class="date-link" href="/#fechas"><span aria-hidden="true">▦</span> Mis fechas</a>
          <a class="icon-link" href="/#favoritos" aria-label="Mis favoritos">♡</a>
          @if (auth.user(); as user) {
            <a
              class="account-link account-name"
              routerLink="/mi-cuenta"
              [attr.title]="'Mi cuenta · ' + user.email"
            >
              <span aria-hidden="true">♙</span> {{ firstName(user.name) }}
            </a>
          } @else {
            <a class="account-link" routerLink="/ingresar">
              <span aria-hidden="true">♙</span> Iniciar sesión
            </a>
          }
          <a
            class="cart-link"
            href="/#carrito"
            [attr.aria-label]="'Carrito: ' + cart.itemCount() + ' productos'"
          >
            <span aria-hidden="true">♧</span>
            {{ cart.subtotal() | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}
          </a>
        </nav>
      </div>
    </header>
  `,
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected firstName(fullName: string): string {
    return fullName.trim().split(/\s+/)[0] || fullName;
  }
}
