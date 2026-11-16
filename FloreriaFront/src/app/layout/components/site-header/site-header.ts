import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BRAND_CONFIG } from '../../../core/config/brand.config';
import { FavoritosService } from '../../../features/favoritos/services/favoritos.service';
import { CarritoService } from '../../../features/carrito/services/carrito.service';

@Component({
  selector: 'app-site-header',
  imports: [CurrencyPipe, RouterLink, RouterLinkActive],
  template: `
    <div class="announcement">
      <div class="announcement-inner">
        <span>
          🏪&nbsp; <strong>Recojo en tienda disponible</strong> — Pide online y retira tu arreglo
          listo</span
        >
        <span>💌 &nbsp; Incluye <strong>tarjeta dedicatoria gratis</strong> en cada pedido</span>
      </div>
    </div>

    <header class="header">
      <div class="header-inner">
        <a class="brand" routerLink="/" [attr.aria-label]="brand.name + ', inicio'">
          <picture>
            <source media="(max-width: 760px)" [srcset]="brand.logoMobile" />
            <img [src]="brand.logoDesktop" [alt]="brand.logoAlt" class="brand-logo" />
          </picture>
        </a>

        <nav class="navigation main-nav" aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Inicio
          </a>
          <a routerLink="/catalogo" routerLinkActive="active">Catálogo</a>
          <a routerLink="/nosotros" routerLinkActive="active">Nosotros</a>
          <a routerLink="/galeria" routerLinkActive="active">Galería</a>
        </nav>

        <div class="navigation user-actions">
          @if (auth.hasRole('ADMINISTRADOR', 'OPERARIO')) {
            <a
              class="date-link admin-link"
              routerLink="/admin"
              routerLinkActive="is-active"
              title="Panel de administración y operaciones"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              Panel Admin
            </a>
          }

          <a class="date-link" routerLink="/mis-fechas" routerLinkActive="is-active">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Mis fechas
          </a>

          <a
            class="icon-link"
            routerLink="/favoritos"
            routerLinkActive="is-active"
            aria-label="Mis favoritos"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
              />
            </svg>

            @if (favoritosService.totalFavoritos() > 0) {
              <span class="fav-badge">{{ favoritosService.totalFavoritos() }}</span>
            }
          </a>

          @if (auth.user(); as user) {
            <a
              class="account-link account-name"
              routerLink="/mi-cuenta"
              routerLinkActive="active"
              [attr.title]="'Mi cuenta · ' + user.email"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{{ firstName(user.name) }}</span>
            </a>
          } @else {
            <a class="account-link" routerLink="/ingresar">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Iniciar sesión</span>
            </a>
          }

          <a
            class="cart-link"
            routerLink="/carrito"
            [attr.aria-label]="'Carrito: ' + carritoService.totalUnidades() + ' productos'"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"
              />
              <path
                d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"
              />
              <circle cx="18" cy="20" r="2" />
              <circle cx="8" cy="20" r="2" />
            </svg>
            <span class="cart-amount">{{
              carritoService.subtotal() | currency: 'PEN' : 'S/ ' : '1.2-2'
            }}</span>
          </a>
        </div>
      </div>
    </header>
  `,
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly brand = BRAND_CONFIG;
  protected readonly favoritosService = inject(FavoritosService);
  protected readonly carritoService = inject(CarritoService);

  protected firstName(fullName: string): string {
    return fullName.trim().split(/\s+/)[0] || fullName;
  }

  protected esStaff(): boolean {
    return this.auth.hasRole('ADMINISTRADOR', 'OPERARIO');
  }
}
