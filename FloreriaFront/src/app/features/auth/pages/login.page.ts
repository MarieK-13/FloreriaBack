import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeRedirect } from '../../../core/guards/auth.guards';
import { AuthService } from '../../../core/services/auth.service';
import { IconName, UiIcon } from '../../../shared/components/ui-icon/ui-icon';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, UiIcon],
  template: `
    <div class="auth-page">
      <div class="auth-layout">
        <section class="auth-column" aria-labelledby="login-title">
          <h1 id="login-title">Bienvenida de nuevo</h1>
          <p class="auth-subtitle">Ingresa para ver tus pedidos, favoritos y fechas importantes.</p>

          <div class="auth-card">
            @if (sessionExpired) {
              <p class="auth-alert auth-alert--info" role="status">
                Tu sesión expiró. Vuelve a ingresar para continuar.
              </p>
            }
            @if (serverError()) {
              <p class="auth-alert" role="alert">{{ serverError() }}</p>
            }

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="field">
                <label for="login-email">Correo electrónico</label>
                <input
                  id="login-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="tucorreo@correo.com"
                  [attr.aria-invalid]="showError('email')"
                  aria-describedby="login-email-error"
                />
                @if (showError('email')) {
                  <span class="field-error" id="login-email-error">
                    @if (form.controls.email.hasError('required')) {
                      Ingresa tu correo.
                    } @else if (form.controls.email.hasError('email')) {
                      El correo no tiene un formato válido.
                    } @else {
                      {{ fieldErrors()['email'] }}
                    }
                  </span>
                }
              </div>

              <div class="field">
                <label for="login-password">Contraseña</label>
                <input
                  id="login-password"
                  type="password"
                  formControlName="contrasena"
                  autocomplete="current-password"
                  [attr.aria-invalid]="showError('contrasena')"
                  aria-describedby="login-password-error"
                />
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
                <label class="checkbox">
                  <input type="checkbox" formControlName="recordarme" />
                  <span>Recordarme</span>
                </label>
                <button type="button" class="link-button" (click)="showForgotHelp.set(true)">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              @if (showForgotHelp()) {
                <p class="auth-alert auth-alert--info" role="status">
                  La recuperación de contraseña todavía no está disponible en línea. Escríbenos y te
                  ayudamos a recuperar tu acceso.
                </p>
              }

              <button class="auth-submit" type="submit" [disabled]="loading()">
                {{ loading() ? 'Ingresando…' : 'Iniciar sesión' }}
              </button>
            </form>
          </div>
        </section>

        <aside class="auth-showcase" aria-label="Por qué comprar en FloriaSmart">
          <div class="art-wrap">
            <div class="auth-art">
              <!-- Ilustración propia; si tienen fotos de sus arreglos, basta con cambiar el archivo -->
              <img src="/images/ramo-rosas.svg" alt="Ramo de rosas rosadas envuelto en papel" />
            </div>
            <span class="floating-chip"
              ><span class="dot" aria-hidden="true"></span> Entrega hoy</span
            >
            <div class="floating-card">
              <app-ui-icon name="bell" [size]="18" />
              <div>
                <strong>Tus fechas, siempre a tiempo</strong>
                <span>Te avisamos antes de cada ocasión</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <p class="auth-switch">
        ¿Aún no tienes cuenta?
        <a routerLink="/registro" [queryParams]="redirectParams">Regístrate</a>
      </p>

      <ul class="auth-benefits" aria-label="Beneficios">
        @for (benefit of benefits; track benefit.title) {
          <li>
            <span class="benefit-icon"><app-ui-icon [name]="benefit.icon" /></span>
            <div>
              <strong>{{ benefit.title }}</strong>
              <span>{{ benefit.text }}</span>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './auth-page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly redirect = safeRedirect(this.route.snapshot.queryParamMap.get('redirect'));
  protected readonly redirectParams = this.redirect === '/' ? {} : { redirect: this.redirect };
  protected readonly sessionExpired =
    this.route.snapshot.queryParamMap.get('motivo') === 'sesion-expirada';

  protected readonly benefits: { icon: IconName; title: string; text: string }[] = [
    { icon: 'truck', title: 'Entrega el mismo día', text: 'En Ica y alrededores' },
    { icon: 'calendar', title: 'Pedidos programados', text: 'Elige fecha y hora' },
    { icon: 'flower', title: 'Flores frescas', text: 'Duran de 5 a 10 días' },
    { icon: 'chat', title: 'Asistente de cotización', text: 'Arma tu arreglo a medida' },
  ];

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly showForgotHelp = signal(false);

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
    this.auth.login({ email, contrasena }, recordarme).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl(this.redirect);
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
