import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../../../shared/components/ui-button/ui-button';

interface CampaignItem {
  id: string;
  titulo: string;
  ocasionParam: string;
  descuentoTexto: string;
  rangoFechasTexto: string;
  month: number;
  day: number;
  itemsIncluidos: string[];
}

@Component({
  selector: 'app-campaign-panel',
  imports: [RouterLink, UiButton],
  template: `
    <section class="campaign page-width" aria-labelledby="campaign-title">
      <div class="campaign-inner">
        <div class="campaign-copy">
          <p class="campaign-label">CAMPAÑA PRÓXIMA</p>
          <h2 id="campaign-title">{{ activeCampaign().titulo }}</h2>
          <p class="campaign-desc">
            {{ activeCampaign().descuentoTexto }}, {{ activeCampaign().rangoFechasTexto }}. Activa
            el aviso y te escribimos el primer día.
          </p>

          <div class="campaign-actions">
            <app-ui-button (click)="activarAviso()">
              {{ avisoActivado() ? '✓ Aviso activado' : 'Avísame cuando empiece' }}
            </app-ui-button>
            <app-ui-button
              variant="outline"
              routerLink="/catalogo"
              [queryParams]="{ ocasion: activeCampaign().ocasionParam }"
            >
              Ver productos
            </app-ui-button>
          </div>

          @if (avisoActivado()) {
            <p class="campaign-feedback" role="status">
              ¡Listo! Te avisaremos en cuanto comience la campaña de {{ activeCampaign().titulo }}.
            </p>
          }
        </div>

        <div class="campaign-side">
          <p class="side-heading">Comienza en</p>
          <div class="countdown-grid" aria-label="Tiempo restante para la campaña">
            <div class="time-box">
              <strong>{{ countdown().days }}</strong>
              <span>días</span>
            </div>
            <div class="time-box">
              <strong>{{ countdown().hours }}</strong>
              <span>horas</span>
            </div>
            <div class="time-box">
              <strong>{{ countdown().minutes }}</strong>
              <span>min</span>
            </div>
            <div class="time-box">
              <strong>{{ countdown().seconds }}</strong>
              <span>seg</span>
            </div>
          </div>

          <p class="side-heading side-heading--list">Entra en la campaña</p>
          <ul class="campaign-list">
            @for (item of activeCampaign().itemsIncluidos; track item) {
              <li>
                <span class="list-dot" aria-hidden="true"></span>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styleUrl: './campaign-panel.scss',
})
export class CampaignPanel implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private readonly campanasAnuales: CampaignItem[] = [
    {
      id: 'san-valentin',
      titulo: 'San Valentín',
      ocasionParam: 'San Valentín',
      descuentoTexto: '15% de descuento en rosas rojas y boxes románticos',
      rangoFechasTexto: 'del 10 al 14 de febrero',
      month: 2,
      day: 10,
      itemsIncluidos: [
        'Ramos de 12 y 24 rosas importadas',
        'Boxes corazón con chocolates',
        'Arreglos con tulipanes y peluche',
      ],
    },
    {
      id: 'dia-mujer',
      titulo: 'Día Internacional de la Mujer',
      ocasionParam: 'Día de la Mujer',
      descuentoTexto: '15% de descuento en ramos y arreglos florales',
      rangoFechasTexto: 'del 6 al 8 de marzo',
      month: 3,
      day: 6,
      itemsIncluidos: [
        'Ramos de rosas rosadas',
        'Arreglos de tulipanes',
        'Boxes florales personalizados',
      ],
    },
    {
      id: 'dia-madre',
      titulo: 'Día de la Madre',
      ocasionParam: 'Día de la Madre',
      descuentoTexto: '20% en girasoles y tulipanes',
      rangoFechasTexto: 'del 5 al 10 de mayo',
      month: 5,
      day: 5,
      itemsIncluidos: [
        'Girasoles de tallo largo',
        'Tulipanes mixtos',
        'Combos especiales para mamá',
      ],
    },

    {
      id: 'dia-padre',
      titulo: 'Día del Padre',
      ocasionParam: 'Día del Padre',
      descuentoTexto: '15% en plantas ornamentales y boxes gourmet',
      rangoFechasTexto: 'del 12 al 16 de junio',
      month: 6,
      day: 12,
      itemsIncluidos: [
        'Bonsáis y plantas de escritorio',
        'Boxes con café y detalles',
        'Arreglos sobrios de temporada',
      ],
    },
    {
      id: 'dia-maestro',
      titulo: 'Día del Maestro',
      ocasionParam: 'Día del Maestro',
      descuentoTexto: '15% de descuento en arreglos para agradecer a los maestros',
      rangoFechasTexto: 'del 4 al 6 de julio',
      month: 7,
      day: 4,
      itemsIncluidos: [
        'Bouquets de girasoles',
        'Ramos de flores mixtas',
        'Boxes de flores y chocolates',
      ],
    },
    {
      id: 'dia-amistad',
      titulo: 'Día de la Amistad',
      ocasionParam: 'Día de la Amistad',
      descuentoTexto: '15% de descuento en arreglos para compartir',
      rangoFechasTexto: 'del 28 al 30 de julio',
      month: 7,
      day: 28,
      itemsIncluidos: [
        'Ramos de flores coloridas',
        'Mini bouquets para amigas',
        'Boxes de amistad',
      ],
    },
    {
      id: 'flores-amarillas',
      titulo: 'Día de las Flores Amarillas',
      ocasionParam: 'Flores Amarillas',
      descuentoTexto: '15% de descuento en ramos de girasoles y flores amarillas',
      rangoFechasTexto: 'del 19 al 21 de marzo',
      month: 3,
      day: 19,
      itemsIncluidos: [
        'Ramos de girasoles',
        'Boxes de flores amarillas',
        'Arreglos con rosas amarillas y margaritas',
      ],
    },
    {
      id: 'dia-primavera',
      titulo: 'Bienvenida Primavera',
      ocasionParam: 'Primavera',
      descuentoTexto: '15% de descuento en arreglos primaverales',
      rangoFechasTexto: 'del 21 al 23 de septiembre',
      month: 9,
      day: 21,
      itemsIncluidos: [
        'Ramos de gerberas',
        'Arreglos de margaritas',
        'Bouquets de flores variadas',
      ],
    },
    {
      id: 'dia-del-novio',
      titulo: 'Día del Novio',
      ocasionParam: 'Día del Novio',
      descuentoTexto: '15% de descuento en arreglos románticos para él',
      rangoFechasTexto: 'del 1 al 3 de octubre',
      month: 10,
      day: 1,
      itemsIncluidos: [
        'Ramos de rosas rojas',
        'Boxes con chocolates y peluches',
        'Arreglos personalizados para novio',
      ],
    },
    {
      id: 'graduaciones',
      titulo: 'Temporada de Graduaciones',
      ocasionParam: 'Graduaciones',
      descuentoTexto: '15% de descuento en ramos y bouquets para graduados',
      rangoFechasTexto: 'durante todo diciembre',
      month: 12,
      day: 1,
      itemsIncluidos: [
        'Ramos de rosas y girasoles',
        'Bouquets de felicitaciones',
        'Arreglos personalizados para graduados',
      ],
    },

    {
      id: 'navidad',
      titulo: 'Navidad',
      ocasionParam: 'Navidad',
      descuentoTexto: '20% en centros de mesa y arreglos navideños',
      rangoFechasTexto: 'del 15 al 24 de diciembre',
      month: 12,
      day: 15,
      itemsIncluidos: [
        'Centros de mesa con velas',
        'Rosas rojas y follaje invernal',
        'Canastas florales de regalo',
      ],
    },
  ];

  protected readonly now = signal(new Date());
  protected readonly avisoActivado = signal(false);

  protected readonly nextCampaignData = computed(() => {
    const current = this.now();
    const year = current.getFullYear();

    const upcomingThisYear = this.campanasAnuales
      .map((c) => ({
        campaign: c,
        targetDate: new Date(year, c.month - 1, c.day, 0, 0, 0),
      }))
      .find((entry) => entry.targetDate.getTime() > current.getTime());

    if (upcomingThisYear) {
      return upcomingThisYear;
    }

    const firstNextYear = this.campanasAnuales[0];
    return {
      campaign: firstNextYear,
      targetDate: new Date(year + 1, firstNextYear.month - 1, firstNextYear.day, 0, 0, 0),
    };
  });

  protected readonly activeCampaign = computed(() => this.nextCampaignData().campaign);

  protected readonly countdown = computed(() => {
    const diff = Math.max(0, this.nextCampaignData().targetDate.getTime() - this.now().getTime());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  });

  ngOnInit(): void {
    const interval = setInterval(() => {
      this.now.set(new Date());
    }, 1000);

    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  protected activarAviso(): void {
    this.avisoActivado.update((v) => !v);
    // Futuro: aquí llamarás a CampaignService.suscribirAviso(this.activeCampaign().id) en Spring Boot
  }
}
