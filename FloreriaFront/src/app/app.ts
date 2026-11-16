import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SiteFooter } from './layout/components/site-footer/site-footer';
import { SiteHeader } from './layout/components/site-header/site-header';
import { ToastNotificacion } from './shared/components/toast-notification/pages/toast-notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastNotificacion, SiteFooter, SiteHeader],
  template: `
    @if (!isAdminArea()) {
      <app-site-header />
    }

    <main id="contenido" [class.admin-content]="isAdminArea()">
      <router-outlet />
      <app-toast-notificacion />
    </main>

    @if (!isAdminArea()) {
      <app-site-footer />
    }
  `,
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly isAdminArea = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );
}
