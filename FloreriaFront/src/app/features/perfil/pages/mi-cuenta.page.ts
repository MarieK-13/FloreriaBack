import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserProfile } from '../../../core/models/auth.model';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiIcon } from '../../../shared/components/ui-icon/ui-icon';
import { DatosPersonales } from '../components/datos-personales';
import { SeguridadCuenta } from '../components/seguridad-cuenta';

/** "Mi cuenta" (mockup pág. 13): ver y editar los datos, cambiar correo/contraseña y eliminar la cuenta. */
@Component({
  selector: 'app-mi-cuenta-page',
  imports: [RouterLink, UiIcon, DatosPersonales, SeguridadCuenta],
  template: `
    <div class="account-page">
      <header class="account-header">
        <h1>Mi cuenta</h1>
        <p>Gestiona tus datos, tu seguridad y tus pedidos</p>
      </header>

      @if (loadError()) {
        <div class="state-card" role="alert">
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
                  <strong>{{ fullName() }}</strong>
                  <span>{{ current.email }}</span>
                </div>
              </div>

              <nav aria-label="Secciones de mi cuenta">
                <a
                  routerLink="/mi-cuenta"
                  fragment="datos"
                  [class.active]="section() === 'datos'"
                  [attr.aria-current]="section() === 'datos' ? 'true' : null"
                >
                  <app-ui-icon name="user" [size]="18" /> Mis datos
                </a>
                <a
                  routerLink="/mi-cuenta"
                  fragment="seguridad"
                  [class.active]="section() === 'seguridad'"
                  [attr.aria-current]="section() === 'seguridad' ? 'true' : null"
                >
                  <app-ui-icon name="lock" [size]="18" /> Seguridad
                </a>
                <span class="nav-soon" title="Muy pronto">
                  <app-ui-icon name="box" [size]="18" /> Mis pedidos <small>Pronto</small>
                </span>
                <a href="/#fechas"><app-ui-icon name="calendar" [size]="18" /> Mis fechas</a>
                <a href="/#favoritos"><app-ui-icon name="heart" [size]="18" /> Favoritos</a>
                <button type="button" class="nav-logout" (click)="auth.logout()">
                  <app-ui-icon name="logout" [size]="18" /> Cerrar sesión
                </button>
              </nav>
            </aside>

            <div class="account-main">
              <app-datos-personales
                id="datos"
                [profile]="current"
                (profileChange)="profile.set($event)"
              />
              <app-seguridad-cuenta
                id="seguridad"
                [profile]="current"
                (emailChange)="onEmailChange($event)"
              />
            </div>
          </div>
        } @else {
          <div class="state-card" role="status">
            <span class="spinner" aria-hidden="true"></span> Cargando tus datos…
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
