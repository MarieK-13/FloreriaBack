import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeRedirect } from '../../../core/guards/auth.guards';
import { AuthService } from '../../../core/services/auth.service';
import { IconName, UiIcon } from '../../../shared/components/ui-icon/ui-icon';
import { fieldsMatch, notBlank, PERU_MOBILE } from '../../../shared/validators/form-validators';

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
  imports: [ReactiveFormsModule, RouterLink, UiIcon],
  template: `
    <div class="auth-page">
      <div class="auth-layout">
        <section class="auth-column" aria-labelledby="register-title">
          <h1 id="register-title">Crea tu cuenta</h1>
          <p class="auth-subtitle">Guarda tus fechas especiales y sigue tus pedidos.</p>

          <div class="auth-card">
            @if (serverError()) {
              <p class="auth-alert" role="alert">{{ serverError() }}</p>
            }

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="field-row">
                <div class="field">
                  <label for="register-name">Nombres</label>
                  <input
                    id="register-name"
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
                    type="email"
                    formControlName="email"
                    autocomplete="email"
                    maxlength="150"
                    placeholder="tucorreo@correo.com"
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
                    type="tel"
                    formControlName="telefono"
                    autocomplete="tel"
                    inputmode="tel"
                    maxlength="16"
                    placeholder="+51 9XX XXX XXX"
                    [attr.aria-invalid]="showError('telefono')"
                    aria-describedby="register-phone-hint register-phone-error"
                  />
                  <span class="field-hint" id="register-phone-hint"
                    >Para coordinar tus entregas.</span
                  >
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
                  <input
                    id="register-password"
                    type="password"
                    formControlName="contrasena"
                    autocomplete="new-password"
                    maxlength="72"
                    [attr.aria-invalid]="showError('contrasena')"
                    aria-describedby="register-password-hint register-password-error"
                  />
                  @if (showError('contrasena')) {
                    <span class="field-error" id="register-password-error">
                      @if (hasLocalError('contrasena', 'required')) {
                        Crea una contraseña.
                      } @else if (hasLocalError('contrasena', 'minlength', 'maxlength')) {
                        Debe tener entre 6 y 72 caracteres.
                      } @else {
                        {{ fieldErrors()['contrasena'] }}
                      }
                    </span>
                  }
                </div>

                <div class="field">
                  <label for="register-confirmation">Confirmar contraseña</label>
                  <input
                    id="register-confirmation"
                    type="password"
                    formControlName="confirmacion"
                    autocomplete="new-password"
                    maxlength="72"
                    [attr.aria-invalid]="showError('confirmacion')"
                    aria-describedby="register-confirmation-error"
                  />
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

              <p class="field-hint" id="register-password-hint">
                La contraseña debe tener entre 6 y 72 caracteres.
              </p>

              <div class="field">
                <label class="checkbox">
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

              <button class="auth-submit" type="submit" [disabled]="loading()">
                {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
              </button>
            </form>
          </div>
        </section>

        <aside class="auth-showcase auth-showcase--register" aria-labelledby="benefits-title">
          <div class="art-wrap art-wrap--small">
            <div class="auth-art">
              <!-- Ilustración propia; si tienen fotos de sus arreglos, basta con cambiar el archivo -->
              <img
                src="/images/ramo-girasoles.svg"
                alt="Ramo de girasoles y tulipanes envuelto en papel kraft"
              />
            </div>
            <span class="floating-chip"
              ><span class="dot" aria-hidden="true"></span> Hecho a mano</span
            >
          </div>

          <div class="benefits-card">
            <h2 id="benefits-title">Con tu cuenta podrás</h2>
            <ul>
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
        </aside>
      </div>

      <p class="auth-switch">
        ¿Ya tienes cuenta?
        <a routerLink="/ingresar" [queryParams]="redirectParams">Inicia sesión</a>
      </p>
    </div>
  `,
  styleUrl: './auth-page.scss',
})
export class RegistroPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly redirect = safeRedirect(this.route.snapshot.queryParamMap.get('redirect'));
  protected readonly redirectParams = this.redirect === '/' ? {} : { redirect: this.redirect };

  protected readonly benefits: { icon: IconName; title: string; text: string }[] = [
    { icon: 'box', title: 'Seguir tus pedidos', text: 'Del taller hasta la puerta, paso a paso.' },
    {
      icon: 'bell',
      title: 'Guardar tus fechas importantes',
      text: 'Te avisamos antes y te sugerimos el arreglo ideal.',
    },
    { icon: 'heart', title: 'Guardar tus favoritos', text: 'Tus arreglos preferidos a un clic.' },
    {
      icon: 'pin',
      title: 'Comprar más rápido',
      text: 'Con tu dirección de entrega guardada en Mi cuenta.',
    },
  ];

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});

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

  /** true si el campo tiene alguno de esos errores de validación del formulario. */
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
      .register({ nombre, apellidos, email, telefono, contrasena, aceptaTerminos: terminos })
      .subscribe({
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
            // El backend llama "aceptaTerminos" a la casilla que aquí es "terminos"
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
