import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  template: `
    <header class="heading">
      @if (eyebrow()) {
        <p class="eyebrow">{{ eyebrow() }}</p>
      }
      <h2 [id]="headingId() || null">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
  styleUrl: './section-heading.scss',
})
export class SectionHeading {
  readonly headingId = input('');
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
