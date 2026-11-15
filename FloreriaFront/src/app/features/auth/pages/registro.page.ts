import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeRedirect } from '../../../core/guards/auth.guards';
import { AuthService } from '../../../core/services/auth.service';
import { fieldsMatch, notBlank, PERU_MOBILE } from '../../../shared/validators/form-validators';
import { FavoritosService } from '../../favoritos/services/favoritos.service';

type RegisterField =
  | 'nombre'
  | 'apellidos'
  | 'email'
  | 'telefono'
  | 'contrasena'
  | 'confirmacion'
  | 'terminos';

@Component({
  selector: 'app-registro-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-viewport">
      <div class="auth-boutique-card auth-boutique-card--wide auth-animate-in">
        <!-- Panel izquierdo: Identidad visual botánica (sin ruido promocional) -->
        <aside class="auth-visual-pane" aria-hidden="true">
          <span class="visual-kicker">✿ FloriaSmart</span>
          <div class="visual-frame">
            <img src="/images/ramo-girasoles.svg" alt="" />
          </div>
          <p class="visual-caption">
            Crea tu perfil floral y guarda tus arreglos y fechas especiales.
          </p>
        </aside>

        <!-- Panel derecho: Formulario exclusivo de registro -->
        <div class="auth-form-pane" aria-labelledby="register-title">
          <header class="auth-header">
            <span class="kicker">Nueva cuenta</span>
            <h1 id="register-title">Crea tu cuenta</h1>
            <p class="auth-subtitle">
              Completa tus datos para comenzar a personalizar tus pedidos.
            </p>
          </header>

          @if (serverError()) {
            <p class="auth-alert auth-alert--error" role="alert">{{ serverError() }}</p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="auth-form">
            <div class="field-row">
              <div class="field">
                <label for="register-name">Nombres</label>
                <input
                  id="register-name"
                  class="control"
                  type="text"
                  formControlName="nombre"
                  autocomplete="given-name"
                  maxlength="100"
                  placeholder="Ana"
                  [attr.aria-invalid]="showError('nombre')"
                  aria-describedby="register-name-error"
                />
                @if (showError('nombre')) {
                  <span class="field-error" id="register-name-error">
                    @if (hasLocalError('nombre', 'required', 'blank')) {
                      Ingresa tus nombres.
                    } @else if (hasLocalError('nombre', 'maxlength')) {
                      Máximo 100 caracteres.
                    } @else {
                      {{ fieldErrors()['nombre'] }}
                    }
                  </span>
                }
              </div>

              <div class="field">
                <label for="register-lastname">Apellidos</label>
                <input
                  id="register-lastname"
                  class="control"
                  type="text"
                  formControlName="apellidos"
                  autocomplete="family-name"
                  maxlength="100"
                  placeholder="Torres"
                  [attr.aria-invalid]="showError('apellidos')"
                  aria-describedby="register-lastname-error"
                />
                @if (showError('apellidos')) {
                  <span class="field-error" id="register-lastname-error">
                    @if (hasLocalError('apellidos', 'required', 'blank')) {
                      Ingresa tus apellidos.
                    } @else if (hasLocalError('apellidos', 'maxlength')) {
                      Máximo 100 caracteres.
                    } @else {
                      {{ fieldErrors()['apellidos'] }}
                    }
                  </span>
                }
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="register-email">Correo electrónico</label>
                <input
                  id="register-email"
                  class="control"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  maxlength="150"
                  placeholder="tucorreo@ejemplo.com"
                  [attr.aria-invalid]="showError('email')"
                  aria-describedby="register-email-error"
                />
                @if (showError('email')) {
                  <span class="field-error" id="register-email-error">
                    @if (hasLocalError('email', 'required')) {
                      Ingresa tu correo.
                    } @else if (hasLocalError('email', 'email')) {
                      El correo no tiene un formato válido.
                    } @else if (hasLocalError('email', 'maxlength')) {
                      Máximo 150 caracteres.
                    } @else {
                      {{ fieldErrors()['email'] }}
                    }
                  </span>
                }
              </div>

              <div class="field">
                <label for="register-phone">Teléfono</label>
                <input
                  id="register-phone"
                  class="control"
                  type="tel"
                  formControlName="telefono"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="16"
                  placeholder="9XX XXX XXX"
                  [attr.aria-invalid]="showError('telefono')"
                  aria-describedby="register-phone-error"
                />
                @if (showError('telefono')) {
                  <span class="field-error" id="register-phone-error">
                    @if (hasLocalError('telefono', 'required')) {
                      Ingresa tu celular.
                    } @else if (hasLocalError('telefono', 'pattern')) {
                      Debe tener 9 dígitos y empezar en 9.
                    } @else {
                      {{ fieldErrors()['telefono'] }}
                    }
                  </span>
                }
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="register-password">Contraseña</label>
                <div class="password-box control" [class.is-invalid]="showError('contrasena')">
                  <input
                    id="register-password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="contrasena"
                    autocomplete="new-password"
                    maxlength="72"
                    placeholder="Mín. 6 caracteres"
                    [attr.aria-invalid]="showError('contrasena')"
                    aria-describedby="register-password-error"
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
                  <span class="field-error" id="register-password-error">
                    @if (hasLocalError('contrasena', 'required')) {
                      Crea una contraseña.
                    } @else if (hasLocalError('contrasena', 'minlength', 'maxlength')) {
                      Entre 6 y 72 caracteres.
                    } @else {
                      {{ fieldErrors()['contrasena'] }}
                    }
                  </span>
                }
              </div>

              <div class="field">
                <label for="register-confirmation">Confirmar contraseña</label>
                <div class="password-box control" [class.is-invalid]="showError('confirmacion')">
                  <input
                    id="register-confirmation"
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    formControlName="confirmacion"
                    autocomplete="new-password"
                    maxlength="72"
                    placeholder="Repite tu clave"
                    [attr.aria-invalid]="showError('confirmacion')"
                    aria-describedby="register-confirmation-error"
                  />
                  <button
                    type="button"
                    class="toggle-pass-btn"
                    (click)="showConfirmPassword.update((v) => !v)"
                    [attr.aria-label]="
                      showConfirmPassword() ? 'Ocultar confirmación' : 'Mostrar confirmación'
                    "
                  >
                    {{ showConfirmPassword() ? 'Ocultar' : 'Ver' }}
                  </button>
                </div>
                @if (showError('confirmacion')) {
                  <span class="field-error" id="register-confirmation-error">
                    @if (hasLocalError('confirmacion', 'required')) {
                      Repite tu contraseña.
                    } @else {
                      Las contraseñas no coinciden.
                    }
                  </span>
                }
              </div>
            </div>

            <div class="field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  formControlName="terminos"
                  [attr.aria-invalid]="showError('terminos')"
                  aria-describedby="register-terms-error"
                />
                <span>Acepto los términos y la política de privacidad</span>
              </label>
              @if (showError('terminos')) {
                <span class="field-error" id="register-terms-error">
                  Debes aceptar los términos para crear tu cuenta.
                </span>
              }
            </div>

            <button class="btn-primary-pill" type="submit" [disabled]="loading()">
              {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>
          </form>

          <div class="divider-floral" aria-hidden="true">
            <span></span><i>✿</i><span></span>
          </div>

          <p class="auth-switch">
            ¿Ya tienes una cuenta?
            <a routerLink="/ingresar" [queryParams]="redirectParams">Inicia sesión</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styleUrl: './auth-page.scss',
})
export class RegistroPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly favoritos = inject(FavoritosService);
  private readonly redirect = safeRedirect(this.route.snapshot.queryParamMap.get('redirect'));
  protected readonly redirectParams = this.redirect === '/' ? {} : { redirect: this.redirect };

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100), notBlank]],
      apellidos: ['', [Validators.required, Validators.maxLength(100), notBlank]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.pattern(PERU_MOBILE)]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
      confirmacion: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]],
    },
    { validators: fieldsMatch('contrasena', 'confirmacion') },
  );

  protected showError(field: RegisterField): boolean {
    const control = this.form.controls[field];
    const touched = control.touched || control.dirty;
    if (field === 'confirmacion') {
      return touched && (control.invalid || this.form.hasError('passwordMismatch'));
    }
    return touched && control.invalid;
  }

  protected hasLocalError(field: RegisterField, ...errors: string[]): boolean {
    const control = this.form.controls[field];
    return errors.some((error) => control.hasError(error));
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

    const { nombre, apellidos, email, telefono, contrasena, terminos } = this.form.getRawValue();
    this.auth
      .register({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        contrasena,
        aceptaTerminos: terminos,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.favoritos.sincronizarYCargarDesdeBackend();
          void this.router.navigateByUrl(this.redirect);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          const { message, fieldErrors } = this.auth.toAuthError(error);
          this.serverError.set(message);
          this.fieldErrors.set(fieldErrors);
          for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
            const control = this.form.get(field === 'aceptaTerminos' ? 'terminos' : field);
            if (control) {
              control.setErrors({ server: fieldMessage });
              control.markAsTouched();
            }
          }
        },
      });
  }
}
