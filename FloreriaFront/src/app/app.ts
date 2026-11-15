import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './layout/components/site-footer/site-footer';
import { SiteHeader } from './layout/components/site-header/site-header';
import { ToastNotificacion } from './shared/components/toast-notification/pages/toast-notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastNotificacion, SiteFooter, SiteHeader],
  template: `
    <app-site-header />

    <main id="contenido">
      <router-outlet />
      <app-toast-notificacion />
    </main>

    <app-site-footer />
  `,
  styleUrl: './app.scss',
})
export class App {}
