import { Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../../core/models/auth.model';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiIcon } from '../../../shared/components/ui-icon/ui-icon';
import {
  formatPeruMobile,
  notBlank,
  PERU_MOBILE,
} from '../../../shared/validators/form-validators';

type ProfileField = 'nombre' | 'apellidos' | 'telefono' | 'distrito' | 'direccion';

/** Tarjeta "Datos personales" de Mi cuenta: U de nombres, apellidos, teléfono, distrito y dirección. */
@Component({
  selector: 'app-datos-personales',
  imports: [ReactiveFormsModule, UiIcon],
  template: `
    <section class="account-card" aria-labelledby="datos-title">
      <h2 id="datos-title">Datos personales</h2>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        @if (serverError()) {
          <p class="alert" role="alert">{{ serverError() }}</p>
        }
        @if (saved()) {
          <p class="alert alert--success" role="status">
            <app-ui-icon name="check" [size]="18" /> Tus datos se guardaron.
          </p>
        }

        <div class="field-row">
          <div class="field">
            <label for="perfil-nombre">Nombres</label>
            <input
              id="perfil-nombre"
              type="text"
              formControlName="nombre"
              autocomplete="given-name"
              maxlength="100"
              [attr.aria-invalid]="showError('nombre')"
            />
            @if (showError('nombre')) {
              <span class="field-error">{{ errorText('nombre') }}</span>
            }
          </div>
          <div class="field">
            <label for="perfil-apellidos">Apellidos</label>
            <input
              id="perfil-apellidos"
              type="text"
              formControlName="apellidos"
              autocomplete="family-name"
              maxlength="100"
              [attr.aria-invalid]="showError('apellidos')"
            />
            @if (showError('apellidos')) {
              <span class="field-error">{{ errorText('apellidos') }}</span>
            }
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="perfil-telefono">Teléfono</label>
            <input
              id="perfil-telefono"
              type="tel"
              formControlName="telefono"
              autocomplete="tel"
              inputmode="tel"
              maxlength="16"
              placeholder="+51 9XX XXX XXX"
              [attr.aria-invalid]="showError('telefono')"
            />
            @if (showError('telefono')) {
              <span class="field-error">{{ errorText('telefono') }}</span>
            }
          </div>
          <div class="field">
            <label for="perfil-distrito">Distrito o ciudad</label>
            <input
              id="perfil-distrito"
              type="text"
              formControlName="distrito"
              autocomplete="address-level2"
              maxlength="100"
              placeholder="Ica"
              [attr.aria-invalid]="showError('distrito')"
            />
            @if (showError('distrito')) {
              <span class="field-error">{{ errorText('distrito') }}</span>
            }
          </div>
        </div>

        <div class="field">
          <label for="perfil-direccion">Dirección de entrega</label>
          <input
            id="perfil-direccion"
            type="text"
            formControlName="direccion"
            autocomplete="street-address"
            maxlength="200"
            placeholder="Av. / Calle, número, referencia"
            [attr.aria-invalid]="showError('direccion')"
            aria-describedby="perfil-direccion-hint"
          />
          <span class="field-hint" id="perfil-direccion-hint">
            La usaremos como dirección sugerida al hacer tus pedidos.
          </span>
          @if (showError('direccion')) {
            <span class="field-error">{{ errorText('direccion') }}</span>
          }
        </div>

        <div class="actions">
          <button class="btn btn--primary" type="submit" [disabled]="loading() || form.pristine">
            {{ loading() ? 'Guardando…' : 'Guardar cambios' }}
          </button>
          <button
            class="btn btn--outline"
            type="button"
            (click)="cancel()"
            [disabled]="loading() || form.pristine"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  `,
  styleUrl: './account-card.scss',
})
export class DatosPersonales {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly profile = input.required<UserProfile>();
  readonly profileChange = output<UserProfile>();

  protected readonly loading = signal(false);
  protected readonly saved = signal(false);
  protected readonly serverError = signal<string | null>(null);
  private readonly fieldErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100), notBlank]],
    apellidos: ['', [Validators.required, Validators.maxLength(100), notBlank]],
    telefono: ['', [Validators.required, Validators.pattern(PERU_MOBILE)]],
    distrito: ['', [Validators.maxLength(100)]],
    direccion: ['', [Validators.maxLength(200)]],
  });

  constructor() {
    // Cada vez que llegan datos nuevos del perfil, se cargan en el formulario.
    effect(() => this.fill(this.profile()));
    this.form.valueChanges.subscribe(() => this.saved.set(false));
  }

  protected showError(field: ProfileField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorText(field: ProfileField): string {
    const control = this.form.controls[field];
    if (control.hasError('required') || control.hasError('blank')) {
      return field === 'telefono' ? 'Ingresa tu celular.' : 'Este dato es obligatorio.';
    }
    if (control.hasError('pattern')) {
      return 'Debe tener 9 dígitos y empezar en 9.';
    }
    if (control.hasError('maxlength')) {
      return `Máximo ${control.getError('maxlength').requiredLength} caracteres.`;
    }
    return this.fieldErrors()[field] ?? '';
  }

  protected cancel(): void {
    this.fill(this.profile());
    this.serverError.set(null);
  }

  protected save(): void {
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

    this.account.updateProfile(this.form.getRawValue()).subscribe({
      next: (profile) => {
        this.loading.set(false);
        this.profileChange.emit(profile); // el padre actualiza el perfil y el effect rellena el formulario
        this.saved.set(true);
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
      },
    });
  }

  /** emitEvent: false para que rellenar el formulario no borre el mensaje de "se guardaron". */
  private fill(profile: UserProfile): void {
    this.form.reset(
      {
        nombre: profile.nombre ?? '',
        apellidos: profile.apellidos ?? '',
        telefono: formatPeruMobile(profile.telefono),
        distrito: profile.distrito ?? '',
        direccion: profile.direccion ?? '',
      },
      { emitEvent: false },
    );
  }
}
