import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'outline' | 'quiet';

@Component({
  selector: 'app-ui-button',
  imports: [RouterLink],
  template: `
    <button
      class="button"
      [routerLink]="routerLink()"
      [class.button--primary]="variant() === 'primary'"
      [class.button--outline]="variant() === 'outline'"
      [class.button--quiet]="variant() === 'quiet'"
      [type]="type()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './ui-button.scss',
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly routerLink = input<string | null>(null);
}
