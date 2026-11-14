import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../../shared/components/section-heading/section-heading';
import { UiButton } from '../../../shared/components/ui-button/ui-button';

interface InstaPost {
  id: number;
  purpose: string;
  title: string;
  caption: string;
  hashtags: string[];
  likes: number;
  liked?: boolean;
  imageUrl: string;
  location: string;
}

interface DayMoment {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

@Component({
  selector: 'app-galeria-page',
  imports: [RouterLink, SectionHeading, UiButton],
  template: `
    <div class="gallery-page gallery-bounds">
      <section class="gallery-hero" aria-labelledby="gallery-title">
        <div class="hero-copy">
          <span class="eyebrow-pill">✿ Diario botánico · Ica</span>
          <h1 id="gallery-title">Historias contadas en <em>pétalos</em></h1>
          <p>
            Explora nuestras entregas reales, el ambiente de nuestro taller y los pequeños
            detalles hechos a mano que acompañan cada ramo.
          </p>
          <div class="hero-actions">
            <app-ui-button routerLink="/catalogo">Ver arreglos disponibles</app-ui-button>
          </div>
        </div>

        <div class="hero-collage" aria-hidden="true">
          <div class="collage-main">
            <img
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80"
              alt=""
            />
          </div>
          <div class="collage-secondary">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
              alt=""
            />
          </div>
          <span class="collage-tag">100% artesanal</span>
        </div>
      </section>

      <section class="insta-section" aria-labelledby="insta-title">
        <div class="section-header-row">
          <div>
            <span class="eyebrow">Entregas con propósito</span>
            <h2 id="insta-title">Momentos que salieron de nuestro taller</h2>
          </div>

          <div class="carousel-controls" aria-label="Controles del carrusel">
            <button
              type="button"
              class="nav-arrow"
              aria-label="Anterior"
              (click)="scrollCarousel(-1)"
            >
              ‹
            </button>
            <button
              type="button"
              class="nav-arrow"
              aria-label="Siguiente"
              (click)="scrollCarousel(1)"
            >
              ›
            </button>
          </div>
        </div>

        <div #carouselTrack class="insta-carousel">
          @for (post of instaPosts(); track post.id) {
            <article class="insta-card">
              <header class="insta-card__header">
                <div class="insta-avatar" aria-hidden="true">✿</div>
                <div class="insta-user">
                  <strong>floriasmart.ica</strong>
                  <span>{{ post.location }}</span>
                </div>
                <span class="purpose-chip">{{ post.purpose }}</span>
              </header>

              <div class="insta-card__photo">
                <img [src]="post.imageUrl" [alt]="post.title" loading="lazy" />
              </div>

              <div class="insta-card__actions">
                <div class="left-icons">
                  <button
                    type="button"
                    class="icon-btn"
                    [class.is-liked]="post.liked"
                    [attr.aria-label]="post.liked ? 'Quitar me gusta' : 'Dar me gusta'"
                    (click)="toggleLike(post.id)"
                  >
                    {{ post.liked ? '♥' : '♡' }}
                  </button>
                  <a
                    href="https://wa.me/51956123456?text=Hola%20FloriaSmart,%20me%20gust%C3%B3%20este%20arreglo%20de%20su%20galer%C3%ADa"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-btn"
                    aria-label="Consultar por WhatsApp"
                  >
                    ➤
                  </a>
                </div>
                <span class="bookmark-icon" aria-hidden="true">🔖</span>
              </div>

              <div class="insta-card__body">
                <p class="likes-count">{{ post.likes }} Me gusta</p>
                <p class="post-caption">
                  <strong>{{ post.title }}</strong> {{ post.caption }}
                </p>
                <p class="post-hashtags">
                  @for (tag of post.hashtags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </p>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="day-strip-section" aria-labelledby="day-title">
        <div class="day-strip-header">
          <div class="day-strip-title-group">
            <h2 id="day-title">Detrás de cada pétalo</h2>
            <p class="day-strip-subtitle">
              Un recorrido por nuestro taller en Ica: selección fresca, armado a mano y acabados artesanales.
            </p>
          </div>
          <p class="day-strip-follow">
            Síguenos en
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="ig-handle"
            >
              &#64;floriasmart.ica
            </a>
          </p>
        </div>

        <div class="day-strip-grid">
          @for (moment of dayMoments; track moment.id) {
            <figure class="day-tile">
              <img [src]="moment.imageUrl" [alt]="moment.title" loading="lazy" />
              <figcaption class="day-tile__caption">
                <strong>{{ moment.title }}</strong>
                <span>{{ moment.subtitle }}</span>
              </figcaption>
            </figure>
          }
        </div>
      </section>

      <section class="gallery-cta">
        <app-section-heading
          headingId="cta-gallery-title"
          title="¿Quieres que preparemos tu próximo detalle?"
          subtitle="Elige un diseño de nuestro catálogo o escríbenos para personalizar cada flor."
        />
        <div class="cta-actions">
          <app-ui-button routerLink="/catalogo">Explorar catálogo</app-ui-button>
          <a
            href="https://wa.me/51956123456?text=Hola%20Flowers,%20quisiera%20cotizar%20un%20arreglo%20floral"
            target="_blank"
            rel="noopener noreferrer"
            class="whatsapp-pill"
          >
            Cotiza con Flowers
          </a>
        </div>
      </section>
    </div>
  `,
  styleUrl: './galeria.page.scss',
})

export class GaleriaPage {
  @ViewChild('carouselTrack') private carouselTrack?: ElementRef<HTMLDivElement>;

  protected readonly instaPosts = signal<InstaPost[]>([
    {
      id: 1,
      purpose: 'Aniversario',
      title: 'Ramo Primaveral Pastel',
      caption: 'Rosas crema, astromelias y eucalipto fresco envueltos en papel seda.',
      hashtags: ['#AniversarioIca', '#FloresFrescas'],
      likes: 362,
      imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=700&q=80',
      location: 'La Angostura, Ica',
    },
    {
      id: 2,
      purpose: 'Amor & Romance',
      title: 'Box de 24 Rosas Rojas',
      caption: 'Tallos seleccionados de corte largo con tarjeta dedicatoria sellada.',
      hashtags: ['#RosasRojas', '#FloriaSmart'],
      likes: 418,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
      location: 'San Isidro, Ica',
    },
    {
      id: 3,
      purpose: 'Cumpleaños',
      title: 'Girasoles de Mañana',
      caption: 'Un arreglo luminoso con follaje silvestre para empezar el día sonriendo.',
      hashtags: ['#Girasoles', '#RegalaFlores'],
      likes: 289,
      imageUrl: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=700&q=80',
      location: 'Cercado de Ica',
    },
    {
      id: 4,
      purpose: 'Gratitud',
      title: 'Bouquet & Lazo de Seda',
      caption: 'Envoltura coreana de doble capa con cinta satinada anudada a mano.',
      hashtags: ['#DetallesArtesanales', '#IcaPerú'],
      likes: 345,
      imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=80',
      location: 'La Moderna, Ica',
    },
    {
      id: 5,
      purpose: 'Especial',
      title: 'Tulipanes & Follaje',
      caption: 'Combinación suave en tonos pastel con tarjeta personalizada.',
      hashtags: ['#Tulipanes', '#HechoAMano'],
      likes: 310,
      imageUrl: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=700&q=80',
      location: 'Parcona, Ica',
    },
  ]);

  protected readonly dayMoments: DayMoment[] = [
    {
      id: 1,
      title: 'Selección matutina',
      subtitle: 'Flores recién llegadas al taller',
      imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 2,
      title: 'Diseño a mano',
      subtitle: 'Armando cada ramo en mesa',
      imageUrl: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 3,
      title: 'Tarjetas y dedicatorias',
      subtitle: 'Mensajes impresos con cariño',
      imageUrl: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 4,
      title: 'Lazos y envolturas',
      subtitle: 'Acabados suaves y elegantes',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 5,
      title: 'Listos para entregar',
      subtitle: 'Hidratados y protegidos en ruta',
      imageUrl: 'https://images.unsplash.com/photo-1523694576729-dc99e9c0f9b4?auto=format&fit=crop&w=700&q=80',
    },
  ];

  protected scrollCarousel(direction: -1 | 1): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    track.scrollBy({ left: direction * 300, behavior: 'smooth' });
  }

  protected toggleLike(postId: number): void {
    this.instaPosts.update((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  }
}
