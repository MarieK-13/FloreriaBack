import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './layout/components/site-footer/site-footer';
import { SiteHeader } from './layout/components/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooter, SiteHeader],
  template: `
    <app-site-header />

    <main id="contenido">
      <router-outlet />
    </main>

    <app-site-footer />
  `,
  styleUrl: './app.scss',
})
export class App {}
