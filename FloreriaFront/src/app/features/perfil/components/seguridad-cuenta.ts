import { Component, inject, input, output, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfile } from '../../../core/models/auth.model';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiIcon } from '../../../shared/components/ui-icon/ui-icon';
import { fieldsMatch } from '../../../shared/validators/form-validators';

type Panel = 'email' | 'password' | 'delete' | null;

/**
 * Tarjeta "Acceso y seguridad" de Mi cuenta:
 * U cambiar correo, U cambiar contraseña y D eliminar la cuenta.
 */
@Component({
  selector: 'app-seguridad-cuenta',
  imports: [ReactiveFormsModule, UiIcon],
  template: `
    <section class="account-card" aria-labelledby="seguridad-title">
      <h2 id="seguridad-title">Acceso y seguridad</h2>

      @if (success()) {
        <p class="alert alert--success" role="status">
          <app-ui-icon name="check" [size]="18" /> {{ success() }}
        </p>
      }

      <!-- Correo -->
      <div class="security-row">
        <div>
          <span class="row-label">Correo electrónico</span>
          <strong class="row-value">{{ profile().email }}</strong>
        </div>
        @if (open() !== 'email') {
          <button class="btn btn--outline btn--small" type="button" (click)="toggle('email')">
            Cambiar correo
          </button>
        }
      </div>
      @if (open() === 'email') {
        <form class="inline-form" [formGroup]="emailForm" (ngSubmit)="changeEmail()" novalidate>
          @if (error()) {
            <p class="alert" role="alert">{{ error() }}</p>
          }
          <div class="field-row">
            <div class="field">
              <label for="nuevo-email">Nuevo correo</label>
              <input
                id="nuevo-email"
                type="email"
                formControlName="nuevoEmail"
                autocomplete="email"
                maxlength="150"
                placeholder="tucorreo@correo.com"
                [attr.aria-invalid]="invalid(emailForm, 'nuevoEmail')"
              />
              @if (invalid(emailForm, 'nuevoEmail')) {
                <span class="field-error">
                  @if (emailForm.controls.nuevoEmail.hasError('required')) {
                    Ingresa el nuevo correo.
                  } @else if (emailForm.controls.nuevoEmail.hasError('email')) {
                    El correo no tiene un formato válido.
                  } @else {
                    {{ fieldErrors()['nuevoEmail'] }}
                  }
                </span>
              }
            </div>
            <div class="field">
              <label for="email-contrasena">Contraseña actual</label>
              <input
                id="email-contrasena"
                type="password"
                formControlName="contrasenaActual"
                autocomplete="current-password"
                [attr.aria-invalid]="invalid(emailForm, 'contrasenaActual')"
              />
              @if (invalid(emailForm, 'contrasenaActual')) {
                <span class="field-error">Ingresa tu contraseña para confirmar.</span>
              }
            </div>
          </div>
          <div class="actions">
            <button class="btn btn--primary" type="submit" [disabled]="loading()">
              {{ loading() ? 'Guardando…' : 'Actualizar correo' }}
            </button>
            <button class="btn btn--outline" type="button" (click)="toggle(null)">Cancelar</button>
          </div>
        </form>
      }

      <!-- Contraseña -->
      <div class="security-row">
        <div>
          <span class="row-label">Contraseña</span>
          <strong class="row-value" aria-label="Contraseña oculta">••••••••</strong>
        </div>
        @if (open() !== 'password') {
          <button class="btn btn--outline btn--small" type="button" (click)="toggle('password')">
            Cambiar contraseña
          </button>
        }
      </div>
      @if (open() === 'password') {
        <form
          class="inline-form"
          [formGroup]="passwordForm"
          (ngSubmit)="changePassword()"
          novalidate
        >
          @if (error()) {
            <p class="alert" role="alert">{{ error() }}</p>
          }
          <div class="field">
            <label for="contrasena-actual">Contraseña actual</label>
            <input
              id="contrasena-actual"
              type="password"
              formControlName="contrasenaActual"
              autocomplete="current-password"
              [attr.aria-invalid]="invalid(passwordForm, 'contrasenaActual')"
            />
            @if (invalid(passwordForm, 'contrasenaActual')) {
              <span class="field-error">Ingresa tu contraseña actual.</span>
            }
          </div>
          <div class="field-row">
            <div class="field">
              <label for="nueva-contrasena">Nueva contraseña</label>
              <input
                id="nueva-contrasena"
                type="password"
                formControlName="nuevaContrasena"
                autocomplete="new-password"
                maxlength="72"
                [attr.aria-invalid]="invalid(passwordForm, 'nuevaContrasena')"
              />
              @if (invalid(passwordForm, 'nuevaContrasena')) {
                <span class="field-error">
                  @if (passwordForm.controls.nuevaContrasena.hasError('required')) {
                    Crea una contraseña nueva.
                  } @else if (
                    passwordForm.controls.nuevaContrasena.hasError('minlength') ||
                    passwordForm.controls.nuevaContrasena.hasError('maxlength')
                  ) {
                    Debe tener entre 6 y 72 caracteres.
                  } @else {
                    {{ fieldErrors()['nuevaContrasena'] }}
                  }
                </span>
              }
            </div>
            <div class="field">
              <label for="confirmar-contrasena">Confirmar nueva contraseña</label>
              <input
                id="confirmar-contrasena"
                type="password"
                formControlName="confirmacion"
                autocomplete="new-password"
                maxlength="72"
                [attr.aria-invalid]="confirmationInvalid()"
              />
              @if (confirmationInvalid()) {
                <span class="field-error">
                  @if (passwordForm.controls.confirmacion.hasError('required')) {
                    Repite la contraseña nueva.
                  } @else {
                    Las contraseñas no coinciden.
                  }
                </span>
              }
            </div>
          </div>
          <span class="field-hint">La contraseña debe tener entre 6 y 72 caracteres.</span>
          <div class="actions">
            <button class="btn btn--primary" type="submit" [disabled]="loading()">
              {{ loading() ? 'Guardando…' : 'Actualizar contraseña' }}
            </button>
            <button class="btn btn--outline" type="button" (click)="toggle(null)">Cancelar</button>
          </div>
        </form>
      }

      <!-- Eliminar cuenta -->
      <div class="danger-zone">
        <div class="security-row security-row--danger">
          <div>
            <span class="row-label">Eliminar cuenta</span>
            <span class="row-help">
              Se borran tus datos personales y ya no podrás entrar con esta cuenta.
            </span>
          </div>
          @if (open() !== 'delete' && profile().rol !== 'ADMINISTRADOR') {
            <button
              class="btn btn--danger-outline btn--small"
              type="button"
              (click)="toggle('delete')"
            >
              Eliminar mi cuenta
            </button>
          }
        </div>
        @if (profile().rol === 'ADMINISTRADOR') {
          <p class="row-help">
            Las cuentas de administrador solo pueden ser eliminadas por otro administrador.
          </p>
        }
        @if (open() === 'delete') {
          <form
            class="inline-form"
            [formGroup]="deleteForm"
            (ngSubmit)="deleteAccount()"
            novalidate
          >
            @if (error()) {
              <p class="alert" role="alert">{{ error() }}</p>
            }
            <p class="alert">
              Esta acción no se puede deshacer. Tus pedidos anteriores se conservan en la tienda,
              pero sin tus datos personales.
            </p>
            <div class="field">
              <label for="eliminar-contrasena">Escribe tu contraseña para confirmar</label>
              <input
                id="eliminar-contrasena"
                type="password"
                formControlName="contrasena"
                autocomplete="current-password"
                [attr.aria-invalid]="invalid(deleteForm, 'contrasena')"
              />
              @if (invalid(deleteForm, 'contrasena')) {
                <span class="field-error">Ingresa tu contraseña.</span>
              }
            </div>
            <label class="checkbox">
              <input type="checkbox" formControlName="entiendo" />
              <span>Entiendo que mi cuenta se eliminará definitivamente.</span>
            </label>
            @if (invalid(deleteForm, 'entiendo')) {
              <span class="field-error">Marca la casilla para continuar.</span>
            }
            <div class="actions">
              <button class="btn btn--danger" type="submit" [disabled]="loading()">
                <app-ui-icon name="trash" [size]="16" />
                {{ loading() ? 'Eliminando…' : 'Eliminar definitivamente' }}
              </button>
              <button class="btn btn--outline" type="button" (click)="toggle(null)">
                Cancelar
              </button>
            </div>
          </form>
        }
      </div>
    </section>
  `,
  styleUrls: ['./account-card.scss', './seguridad-cuenta.scss'],
})
export class SeguridadCuenta {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly profile = input.required<UserProfile>();
  readonly emailChange = output<string>();

  protected readonly open = signal<Panel>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});

  protected readonly emailForm = this.fb.group({
    nuevoEmail: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasenaActual: ['', [Validators.required]],
  });

  protected readonly passwordForm = this.fb.group(
    {
      contrasenaActual: ['', [Validators.required]],
      nuevaContrasena: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(72)],
      ],
      confirmacion: ['', [Validators.required]],
    },
    { validators: fieldsMatch('nuevaContrasena', 'confirmacion') },
  );

  protected readonly deleteForm = this.fb.group({
    contrasena: ['', [Validators.required]],
    entiendo: [false, [Validators.requiredTrue]],
  });

  protected toggle(panel: Panel): void {
    this.open.set(panel);
    this.error.set(null);
    this.fieldErrors.set({});
    if (panel !== null) {
      this.success.set(null);
    }
    this.emailForm.reset();
    this.passwordForm.reset();
    this.deleteForm.reset();
  }

  protected invalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected confirmationInvalid(): boolean {
    const control = this.passwordForm.controls.confirmacion;
    const touched = control.touched || control.dirty;
    return touched && (control.invalid || this.passwordForm.hasError('passwordMismatch'));
  }

  protected changeEmail(): void {
    if (!this.ready(this.emailForm)) {
      return;
    }
    this.account.changeEmail(this.emailForm.getRawValue()).subscribe({
      next: (email) => {
        this.done(`Listo. Ahora ingresas con ${email}.`);
        this.emailChange.emit(email);
      },
      error: (error: unknown) => this.fail(error, this.emailForm, 'contrasenaActual'),
    });
  }

  protected changePassword(): void {
    if (!this.ready(this.passwordForm)) {
      return;
    }
    this.account.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => this.done('Tu contraseña se actualizó.'),
      error: (error: unknown) => this.fail(error, this.passwordForm, 'contrasenaActual'),
    });
  }

  protected deleteAccount(): void {
    if (!this.ready(this.deleteForm)) {
      return;
    }
    this.account.deleteAccount(this.deleteForm.controls.contrasena.value).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (error: unknown) => this.fail(error, this.deleteForm, 'contrasena'),
    });
  }

  /** Valida el formulario y deja todo listo para enviar. */
  private ready(form: FormGroup): boolean {
    if (this.loading()) {
      return false;
    }
    if (form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    this.loading.set(true);
    this.error.set(null);
    this.fieldErrors.set({});
    return true;
  }

  private done(message: string): void {
    this.loading.set(false);
    this.toggle(null);
    this.success.set(message);
  }

  /** Muestra el error y limpia el campo de contraseña para que la vuelva a escribir. */
  private fail(error: unknown, form: FormGroup, passwordField: string): void {
    this.loading.set(false);
    const { message, fieldErrors } = this.auth.toAuthError(error);
    this.error.set(message);
    this.fieldErrors.set(fieldErrors);
    for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
      const control = form.get(field);
      if (control) {
        control.setErrors({ server: fieldMessage });
        control.markAsTouched();
      }
    }
    form.get(passwordField)?.reset();
  }
}
