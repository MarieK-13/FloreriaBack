import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="footer" id="nosotros">
      <div class="footer-inner">
        <section class="footer-brand">
          <a href="/" class="brand">FloriaSmart</a>
          <p>Flores frescas, cotizaciones a tu medida y recordatorios de tus fechas especiales.</p>
        </section>
        <nav class="footer-links" aria-label="Tienda">
          <h2>Tienda</h2>
          <a href="/#catalogo">Catálogo</a>
          <a href="/#cotizador">Cotizador</a>
          <a href="/#fechas">Mis fechas</a>
        </nav>
        <nav class="footer-links" aria-label="Ayuda">
          <h2>Ayuda</h2>
          <a href="/#entregas">Entregas y devoluciones</a>
          <a href="/#cuidados">Guía de flores</a>
          <a href="/#contacto">Contacto</a>
        </nav>
        <p class="copyright">Fotos referenciales<br />© {{ year }} FloriaSmart</p>
      </div>
    </footer>
  `,
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
