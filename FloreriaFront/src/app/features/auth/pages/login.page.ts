import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeRedirect } from '../../../core/guards/auth.guards';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../favoritos/services/favoritos.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-viewport">
      <div class="auth-boutique-card auth-animate-in">
        <aside class="auth-visual-pane" aria-hidden="true">
          <span class="visual-kicker">✿ FloriaSmart</span>
          <div class="visual-frame">
            <img src="/images/ramo-rosas.svg" alt="" />
          </div>
          <p class="visual-caption">
            Tus arreglos favoritos y pedidos especiales, reunidos en un solo lugar.
          </p>
        </aside>

        <div class="auth-form-pane" aria-labelledby="login-title">
          <header class="auth-header">
            <span class="kicker">Acceso a tu cuenta</span>
            <h1 id="login-title">Bienvenida de nuevo</h1>
            <p class="auth-subtitle">Ingresa tus datos para continuar con tu experiencia floral.</p>
          </header>

          @if (sessionExpired) {
            <p class="auth-alert auth-alert--info" role="status">
              Tu sesión expiró. Vuelve a ingresar para continuar.
            </p>
          }
          @if (serverError()) {
            <p class="auth-alert auth-alert--error" role="alert">{{ serverError() }}</p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="auth-form">
            <div class="field">
              <label for="login-email">Correo electrónico</label>
              <input
                id="login-email"
                class="control"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="tucorreo@ejemplo.com"
                [attr.aria-invalid]="showError('email')"
                aria-describedby="login-email-error"
              />
              @if (showError('email')) {
                <span class="field-error" id="login-email-error">
                  @if (form.controls.email.hasError('required')) {
                    Ingresa tu correo electrónico.
                  } @else if (form.controls.email.hasError('email')) {
                    El formato del correo no es válido.
                  } @else {
                    {{ fieldErrors()['email'] }}
                  }
                </span>
              }
            </div>

            <div class="field">
              <label for="login-password">Contraseña</label>
              <div class="password-box control" [class.is-invalid]="showError('contrasena')">
                <input
                  id="login-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="contrasena"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  [attr.aria-invalid]="showError('contrasena')"
                  aria-describedby="login-password-error"
                />
                <button
                  type="button"
                  class="toggle-pass-btn"
                  (click)="showPassword.update((v) => !v)"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  {{ showPassword() ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              @if (showError('contrasena')) {
                <span class="field-error" id="login-password-error">
                  @if (form.controls.contrasena.hasError('required')) {
                    Ingresa tu contraseña.
                  } @else {
                    {{ fieldErrors()['contrasena'] }}
                  }
                </span>
              }
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="recordarme" />
                <span>Recordarme</span>
              </label>

              <button type="button" class="link-subtle" (click)="showForgotHelp.update((v) => !v)">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            @if (showForgotHelp()) {
              <p class="auth-alert auth-alert--info" role="status">
                La recuperación automática aún no está habilitada. Escríbenos por WhatsApp o correo
                y restablecemos tu acceso enseguida.
              </p>
            }

            <button class="btn-primary-pill" type="submit" [disabled]="loading()">
              {{ loading() ? 'Ingresando…' : 'Iniciar sesión' }}
            </button>
          </form>

          <div class="divider-floral" aria-hidden="true"><span></span><i>✿</i><span></span></div>

          <p class="auth-switch">
            ¿Aún no tienes una cuenta?
            <a routerLink="/registro" [queryParams]="redirectParams">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styleUrl: './auth-page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly favoritos = inject(FavoritosService);
  private readonly redirect = safeRedirect(this.route.snapshot.queryParamMap.get('redirect'));
  protected readonly redirectParams = this.redirect === '/' ? {} : { redirect: this.redirect };
  protected readonly sessionExpired =
    this.route.snapshot.queryParamMap.get('motivo') === 'sesion-expirada';

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly showForgotHelp = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
    recordarme: [false],
  });

  protected showError(field: 'email' | 'contrasena'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.loading()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);
    this.fieldErrors.set({});

    const { email, contrasena, recordarme } = this.form.getRawValue();
    this.auth.login({ email: email.trim().toLowerCase(), contrasena }, recordarme).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.favoritos.sincronizarYCargarDesdeBackend();
        const destination = response.rol === 'ADMINISTRADOR' ? '/dashboard' : this.redirect;
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        const { message, fieldErrors } = this.auth.toAuthError(error);
        this.serverError.set(message);
        this.fieldErrors.set(fieldErrors);
        for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
          const control = this.form.get(field);
          if (control) {
            control.setErrors({ server: fieldMessage });
            control.markAsTouched();
          }
        }
        this.form.controls.contrasena.reset();
      },
    });
  }
}
