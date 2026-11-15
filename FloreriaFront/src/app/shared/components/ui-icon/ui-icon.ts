import { Component, input } from '@angular/core';

export type IconName =
  | 'truck'
  | 'calendar'
  | 'flower'
  | 'chat'
  | 'box'
  | 'bell'
  | 'heart'
  | 'pin'
  | 'user'
  | 'lock'
  | 'logout'
  | 'check'
  | 'trash';

/** Íconos de línea simples (24×24) que toman el color del texto. */
@Component({
  selector: 'app-ui-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('truck') {
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="17.5" r="1.7" />
          <circle cx="17" cy="17.5" r="1.7" />
        }
        @case ('calendar') {
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        }
        @case ('flower') {
          <path d="M12 21v-7" />
          <path d="M12 14c-4 0-6-3-6-6 3 0 6 2 6 6zM12 14c4 0 6-3 6-6-3 0-6 2-6 6z" />
          <circle cx="12" cy="5.5" r="2.5" />
        }
        @case ('chat') {
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 10h8M8 13h5" />
        }
        @case ('box') {
          <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
          <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
        }
        @case ('bell') {
          <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        }
        @case ('heart') {
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        }
        @case ('pin') {
          <path d="M12 21s6-5.6 6-11a6 6 0 0 0-12 0c0 5.4 6 11 6 11z" />
          <circle cx="12" cy="10" r="2.2" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
        }
        @case ('lock') {
          <rect x="5" y="10.5" width="14" height="10" rx="2" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        }
        @case ('logout') {
          <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
          <path d="M10 8l-4 4 4 4M6 12h10" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('trash') {
          <path d="M4 7h16M10 11v6M14 11v6" />
          <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
  `,
})
export class UiIcon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
