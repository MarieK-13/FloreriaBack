import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserProfile } from '../../../core/models/auth.model';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiIcon } from '../../../shared/components/ui-icon/ui-icon';
import { DatosPersonales } from '../components/datos-personales';
import { SeguridadCuenta } from '../components/seguridad-cuenta';

/** "Mi cuenta" (mockup pág. 13): ver y editar los datos, cambiar correo/contraseña y acceso rápido a pedidos. */
@Component({
  selector: 'app-mi-cuenta-page',
  imports: [RouterLink, UiIcon, DatosPersonales, SeguridadCuenta],
  template: `
    <div class="account-page">
      <header class="account-hero">
        <div class="hero-copy">
          <span class="hero-kicker">Perfil personal · FloriaSmart</span>
          <h1>Mi cuenta</h1>
        </div>

        @if (profile(); as current) {
          <div class="hero-highlights" aria-label="Resumen de tu cuenta">
            <div class="highlight-card">
              <div class="highlight-icon">
                <app-ui-icon name="pin" [size]="20" />
              </div>
              <div class="highlight-info">
                <span class="highlight-label">Entrega habitual</span>
                <strong>{{ current.distrito || 'Sin distrito registrado' }}</strong>
                <span>{{ current.direccion || 'Completa tu dirección abajo' }}</span>
              </div>
            </div>

            <div class="highlight-card">
              <div class="highlight-icon">
                <app-ui-icon name="phone" [size]="20" />
              </div>
              <div class="highlight-info">
                <span class="highlight-label">Contacto de reparto</span>
                <strong>{{ current.telefono || 'Sin teléfono' }}</strong>
                <span>Avisos de entrega y dedicatorias</span>
              </div>
            </div>

            <div class="highlight-card highlight-accent">
              <div class="highlight-icon">
                <app-ui-icon name="star" [size]="20" />
              </div>
              <div class="highlight-info">
                <span class="highlight-label">Experiencia floral</span>
                <strong>Cliente FloriaSmart</strong>
                <span>Yape, Plin o tarjeta al confirmar</span>
              </div>
            </div>
          </div>
        }
      </header>

      @if (loadError()) {
        <div class="state-card state-error" role="alert">
          <p>{{ loadError() }}</p>
          <button type="button" class="retry-button" (click)="load()">Reintentar</button>
        </div>
      } @else {
        @if (profile(); as current) {
          <div class="account-layout">
            <aside class="account-sidebar">
              <div class="identity">
                <span class="avatar" aria-hidden="true">{{ initials() }}</span>
                <div class="identity-text">
                  <span class="role-badge">{{ current.rol || 'CLIENTE' }}</span>
                  <strong>{{ fullName() }}</strong>
                  <span class="email-text">{{ current.email }}</span>
                </div>
              </div>

              <div class="sidebar-divider"></div>

              <nav aria-label="Secciones de mi cuenta">
                <a
                  routerLink="/mi-cuenta"
                  fragment="datos"
                  [class.active]="section() === 'datos'"
                  [attr.aria-current]="section() === 'datos' ? 'true' : null"
                >
                  <app-ui-icon name="user" [size]="18" />
                  <span>Mis datos</span>
                </a>
                <a
                  routerLink="/mi-cuenta"
                  fragment="seguridad"
                  [class.active]="section() === 'seguridad'"
                  [attr.aria-current]="section() === 'seguridad' ? 'true' : null"
                >
                  <app-ui-icon name="lock" [size]="18" />
                  <span>Seguridad</span>
                </a>

                <div class="sidebar-divider"></div>

                <a routerLink="/mis-pedidos" class="nav-highlight">
                  <app-ui-icon name="box" [size]="18" />
                  <span>Mis pedidos</span>
                  <span class="nav-pill">Historial</span>
                </a>
                <a routerLink="/mis-fechas">
                  <app-ui-icon name="calendar" [size]="18" />
                  <span>Mis fechas</span>
                </a>
                <a routerLink="/favoritos">
                  <app-ui-icon name="heart" [size]="18" />
                  <span>Favoritos</span>
                </a>

                <div class="sidebar-divider"></div>

                <button type="button" class="nav-logout" (click)="auth.logout()">
                  <app-ui-icon name="logout" [size]="18" />
                  <span>Cerrar sesión</span>
                </button>
              </nav>
            </aside>

            <div class="account-main">
              <section class="account-card">
                <app-datos-personales
                  id="datos"
                  [profile]="current"
                  (profileChange)="profile.set($event)"
                />
              </section>

              <section class="account-card">
                <app-seguridad-cuenta
                  id="seguridad"
                  [profile]="current"
                  (emailChange)="onEmailChange($event)"
                />
              </section>
            </div>
          </div>
        } @else {
          <div class="state-card" role="status">
            <span class="spinner" aria-hidden="true"></span>
            <span>Cargando tus datos personales…</span>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './mi-cuenta.page.scss',
})
export class MiCuentaPage implements OnInit {
  private readonly account = inject(AccountService);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly loadError = signal<string | null>(null);

  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });
  protected readonly section = computed(() =>
    this.fragment() === 'seguridad' ? 'seguridad' : 'datos',
  );

  protected readonly fullName = computed(() => {
    const current = this.profile();
    return current ? [current.nombre, current.apellidos].filter(Boolean).join(' ') : '';
  });

  protected readonly initials = computed(() => {
    const current = this.profile();
    if (!current) {
      return '';
    }
    const first = current.nombre?.trim().charAt(0) ?? '';
    const last =
      current.apellidos?.trim().charAt(0) ??
      current.nombre?.trim().split(/\s+/)[1]?.charAt(0) ??
      '';
    return (first + last).toUpperCase();
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loadError.set(null);
    this.account.getProfile().subscribe({
      next: (profile) => this.profile.set(profile),
      error: (error: unknown) => this.loadError.set(this.auth.toAuthError(error).message),
    });
  }

  protected onEmailChange(email: string): void {
    this.profile.update((current) => (current ? { ...current, email } : current));
  }
}
