import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-campaign-panel',
  imports: [RouterLink],
  template: `
    <section class="campaign" aria-labelledby="campaign-title">
      <div class="campaign-copy">
        <p class="campaign-label">Campaña próxima</p>
        <h2 id="campaign-title">Día de la Madre</h2>
        <p>Encuentra arreglos para celebrar a mamá en nuestro catálogo.</p>
        <a
          class="button-link"
          routerLink="/catalogo"
          [queryParams]="{ ocasion: 'Día de la Madre' }"
        >
          Ver productos
        </a>
      </div>
      <div class="campaign-side">
        <span class="campaign-orbit" aria-hidden="true">✿</span>
        <strong>Flores para compartir</strong>
        <small>Ramos y arreglos de temporada</small>
      </div>
    </section>
  `,
  styleUrl: './campaign-panel.scss',
})
export class CampaignPanel {}
