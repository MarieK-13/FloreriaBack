import { Component } from '@angular/core';

@Component({
  selector: 'app-site-header',
  template: `
    <div class="announcement">
      <div class="announcement-inner">
        <span>⌖ &nbsp; Entregas en Ica y alrededores</span>
        <span>Entrega el mismo día · Programa tu pedido cuando quieras</span>
      </div>
    </div>

    <header class="header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="FloriaSmart, inicio">
          <span class="brand-icon" aria-hidden="true">✿</span>
          <span>FloriaSmart</span>
        </a>
        <nav class="navigation" aria-label="Navegación principal">
          <a href="/">Inicio</a>
          <a href="/#catalogo">Catálogo</a>
          <a href="/#nosotros">Nosotros</a>
          <a class="date-link" href="/#fechas"><span aria-hidden="true">▦</span> Mis fechas</a>
          <a class="icon-link" href="/#favoritos" aria-label="Mis favoritos">♡</a>
          <a class="account-link" href="/#ingresar"><span aria-hidden="true">♙</span> Iniciar sesión</a>
          <a class="cart-link" href="/#carrito"><span aria-hidden="true">♧</span> S/ 0.00</a>
        </nav>
      </div>
    </header>
  `,
  styleUrl: './site-header.scss',
})
export class SiteHeader {}
