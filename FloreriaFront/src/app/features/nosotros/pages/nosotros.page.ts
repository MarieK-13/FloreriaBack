import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../../shared/components/section-heading/section-heading';
import { UiButton } from '../../../shared/components/ui-button/ui-button';

@Component({
  selector: 'app-nosotros-page',
  imports: [RouterLink, SectionHeading, UiButton],
  template: `
    <div class="about-page page-width">
      <!-- 1. Hero editorial con foto circular y detalles flotantes -->
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-copy">
          <span class="eyebrow-pill">✿ Taller floral en Ica</span>
          <h1 id="about-title">Artesanía floral hecha a mano, con <em>alma</em></h1>
          <p>
            Nacimos con la ilusión de convertir cada emoción en un detalle inolvidable. Cada mañana
            seleccionamos flores frescas de corte reciente y diseñamos ramos, boxes y arreglos
            personalizados para celebrar el amor, la gratitud y tus momentos más especiales.
          </p>
          <div class="hero-actions">
            <app-ui-button routerLink="/catalogo">Explorar catálogo</app-ui-button>
            <app-ui-button variant="outline" (click)="scrollToVisit()">
              Ver horarios y tienda
            </app-ui-button>
          </div>
        </div>

        <div class="about-media">
          <div class="circle-frame">
            <img
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=900&q=80"
              alt="Florista preparando un ramo artesanal en el taller"
              class="about-photo-circle"
            />
          </div>
          <div class="floating-badge floating-badge--top">
            <span class="badge-dot" aria-hidden="true"></span>
            <span>Pedidos hoy mismo</span>
          </div>
          <div class="floating-badge floating-badge--bottom">
            <strong>+5 años</strong>
            <span>creando momentos en Ica</span>
          </div>
        </div>
      </section>

      <!-- 2. Cifras de confianza -->
      <section class="stats-bar" aria-label="Nuestra trayectoria en números">
        @for (stat of stats; track stat.label) {
          <div class="stat-item">
            <strong>{{ stat.number }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        }
      </section>

      <!-- 3. Cómo trabajamos (Tarjetas conectadas con paso, icono y tiempo) -->
      <section class="steps-section" aria-labelledby="steps-title">
        <app-section-heading
          headingId="steps-title"
          title="Cómo trabajamos"
          subtitle="Un proceso simple, cercano y pensado para que regalar sea un placer."
        />
        <div class="steps-grid">
          @for (step of steps; track step.number) {
            <article class="step-card">
              <span class="step-watermark" aria-hidden="true">{{ step.number }}</span>
              <div class="step-top">
                <span class="step-icon" aria-hidden="true">{{ step.icon }}</span>
                <span class="step-time">{{ step.time }}</span>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </article>
          }
        </div>
      </section>

      <!-- 4. Nuestra esencia (4 pilares) -->
      <section class="values-section" aria-labelledby="values-title">
        <app-section-heading
          headingId="values-title"
          title="Lo que nos hace diferentes"
          subtitle="Cuidamos desde la selección del tallo hasta el momento en que toca la puerta."
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

      <!-- 5. Visítanos + Mapa UNIFICADOS en una sola tarjeta dividida -->
      <section id="visitanos" class="visit-unified" aria-labelledby="visit-title">
        <div class="visit-info">
          <span class="eyebrow">Ven a conocernos</span>
          <h2 id="visit-title">Visítanos en nuestro taller</h2>
          <p class="visit-intro">
            Te asesoramos en persona o por Flowers nuestro asistente de cotización para elegir el arreglo ideal según tu ocasión.
          </p>

          <!-- Bloque destacado de Horario de Atención -->
          <div class="schedule-box">
            <div class="schedule-header">
              <span class="status-dot" aria-hidden="true"></span>
              <strong>Horario de atención</strong>
            </div>
            <p>Lunes a Sábado: <strong>8:30 a.m. – 8:00 p.m.</strong></p>
            <p>Domingos y feriados: <strong>9:00 a.m. – 2:00 p.m.</strong></p>
          </div>

          <ul class="visit-details">
            <li>
              <span class="detail-icon" aria-hidden="true">📍</span>
              <div>
                <strong>Dirección</strong>
                <span>Av. San Martín 420, Ica – Perú</span>
              </div>
            </li>
            <li>
              <span class="detail-icon" aria-hidden="true">📞</span>
              <div>
                <strong>Teléfono y WhatsApp</strong>
                <span>+51 956 123 456</span>
              </div>
            </li>
            <li>
              <span class="detail-icon" aria-hidden="true">✉️</span>
              <div>
                <strong>Correo</strong>
                <span>hola&#64;floriasmart.com</span>
              </div>
            </li>
          </ul>

          <a
            href="https://wa.me/51956123456?text=Hola%20FloriaSmart,%20quisiera%20consultar%20por%20un%20arreglo%20floral"
            target="_blank"
            rel="noopener noreferrer"
            class="whatsapp-btn"
          >
            Cotizar al instante con Flowers
          </a>
        </div>

        <div class="visit-map">
          <iframe
            title="Ubicación de FloriaSmart en Ica"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-75.7420%2C-14.0750%2C-75.7180%2C-14.0580&layer=mapnik&marker=-14.0678%2C-75.7286"
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  `,
  styleUrl: './nosotros.page.scss',
})
export class NosotrosPage {
  protected readonly stats = [
    { number: '100%', label: 'Flores frescas del día' },
    { number: '+2,500', label: 'Entregas realizadas en Ica' },
    { number: '24h', label: 'Envíos programados y express' },
    { number: '4.9 ★', label: 'Clientes felices' },
  ];

  protected readonly steps = [
    {
      number: '01',
      icon: '🌷',
      time: 'Paso 1',
      title: 'Elige o cotiza',
      description: 'Explora nuestro catálogo online o pídenos un diseño personalizado a tu gusto.',
    },
    {
      number: '02',
      icon: '✓',
      time: 'Paso 2',
      title: 'Confirmamos',
      description: 'Validamos disponibilidad de flores frescas, dedicatoria y franja de entrega.',
    },
    {
      number: '03',
      icon: '✂️',
      time: 'Paso 3',
      title: 'Preparamos a mano',
      description: 'Armamos tu arreglo el mismo día con hidratación especial y empaque boutique.',
    },
    {
      number: '04',
      icon: '🚚',
      time: 'Paso 4',
      title: 'Entregamos puntual',
      description: 'Llevamos tu detalle protegido hasta la puerta en la fecha y hora acordadas.',
    },
  ];

  protected scrollToVisit(): void {
    document.getElementById('visitanos')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected readonly values = [
    {
      icon: '✿',
      title: 'Frescura garantizada',
      description:
        'Seleccionamos tallos firmes cada mañana para asegurar máxima duración en florero.',
    },
    {
      icon: '♡',
      title: 'Diseño de autor',
      description: 'Combinamos texturas, colores armoniosos y envolturas elegantes hechas a mano.',
    },
    {
      icon: '✦',
      title: 'Detalles a tu medida',
      description: 'Personalizamos tarjetas impresas, chocolates, globos o combinaciones florales.',
    },
    {
      icon: '↗',
      title: 'Cuidado en el envío',
      description:
        'Transporte seguro y seguimiento cercano hasta que el arreglo llega a sus manos.',
    },
  ];
}
