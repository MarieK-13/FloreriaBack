import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../../shared/components/section-heading/section-heading';
import { UiButton } from '../../../shared/components/ui-button/ui-button';

@Component({
  selector: 'app-nosotros-page',
  imports: [RouterLink, SectionHeading, UiButton],
  template: `
    <div class="about-page page-width">
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-copy">
          <span class="eyebrow-pill">Nosotros</span>
          <h1 id="about-title">Flores hechas a mano, con <em>historia</em></h1>
          <p>
            Elegimos flores frescas y cuidamos cada detalle para crear arreglos que acompañen tus
            momentos especiales.
          </p>
        </div>
        <div class="about-art" role="img" aria-label="Flores del taller FloriaSmart">
          <span aria-hidden="true">✿</span>
        </div>
      </section>

      <section class="values-section" aria-labelledby="values-title">
        <app-section-heading
          headingId="values-title"
          title="Lo que nos importa"
          subtitle="Tres ideas que guían cada arreglo."
        />
        <div class="values-grid">
          @for (value of values; track value.title) {
            <article class="value-card">
              <span class="value-icon" aria-hidden="true">{{ value.icon }}</span>
              <h2>{{ value.title }}</h2>
              <p>{{ value.description }}</p>
            </article>
          }
        </div>
      </section>

      <section class="craft-section" aria-labelledby="craft-title">
        <div>
          <p class="eyebrow">Con cuidado en cada detalle</p>
          <h2 id="craft-title">Un detalle pensado para ti</h2>
          <p>
            Desde elegir las flores hasta preparar tu pedido, buscamos que regalar sea sencillo y
            especial.
          </p>
          <app-ui-button routerLink="/catalogo">Ver catálogo</app-ui-button>
        </div>
        <div class="craft-art" role="img" aria-label="Arreglo floral preparado para entrega">
          <span aria-hidden="true">❀</span>
        </div>
      </section>

      <section class="contact-section" aria-labelledby="contact-title">
        <div>
          <p class="eyebrow">Estamos para ayudarte</p>
          <h2 id="contact-title">¿Tienes una ocasión especial?</h2>
          <p>Encuentra un arreglo en el catálogo o cuéntanos qué estás buscando.</p>
        </div>
        <span class="contact-link">Contacto</span>
      </section>
    </div>
  `,
  styleUrl: './nosotros.page.scss',
})
export class NosotrosPage {
  protected readonly values = [
    {
      icon: '✿',
      title: 'Flores frescas',
      description: 'Seleccionamos cada flor y te contamos cuánto dura y cómo cuidarla.',
    },
    {
      icon: '♡',
      title: 'A tu medida',
      description: 'Arma tu arreglo con flores, colores, complementos y presupuesto.',
    },
    {
      icon: '↗',
      title: 'Siempre a tiempo',
      description: 'Entregamos el mismo día o en la fecha y hora que programes.',
    },
  ];
}
