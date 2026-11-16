import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminDataService,
  adminApiErrorMessage,
  RolUsuarioAdmin,
  UsuarioAdmin,
} from '../services/admin-data.service';

const USER_ROLES: RolUsuarioAdmin[] = ['CLIENTE', 'OPERARIO', 'ADMINISTRADOR'];

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="admin-section">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Acceso al sistema</p>
          <h1>Usuarios y roles</h1>
          <p>Crea cuentas de equipo, asigna permisos y administra el acceso.</p>
        </div>
        <span class="item-count">{{ filteredUsers().length }} usuarios</span>
      </header>

      @if (errorMessage()) {
        <p class="notice notice--error" role="alert">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="notice notice--success" role="status">{{ successMessage() }}</p>
      }

      <section class="management-panel" aria-labelledby="create-user-title">
        <p class="eyebrow">Nuevo acceso</p>
        <h2 id="create-user-title">Crear usuario</h2>
        <form [formGroup]="form" (ngSubmit)="createUser()" class="user-form">
          <label>
            <span>Nombre *</span>
            <input formControlName="nombre" maxlength="100" />
            @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
              <small>El nombre es obligatorio.</small>
            }
          </label>
          <label>
            <span>Apellidos</span>
            <input formControlName="apellidos" maxlength="100" />
          </label>
          <label>
            <span>Correo electrónico *</span>
            <input type="email" formControlName="email" maxlength="150" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small>Ingresa un correo válido.</small>
            }
          </label>
          <label>
            <span>Teléfono</span>
            <input type="tel" formControlName="telefono" maxlength="20" />
          </label>
          <label>
            <span>Contraseña temporal *</span>
            <input type="password" formControlName="contrasena" minlength="6" maxlength="72" />
            @if (form.controls.contrasena.touched && form.controls.contrasena.invalid) {
              <small>Debe tener al menos 6 caracteres.</small>
            }
          </label>
          <label>
            <span>Rol *</span>
            <select formControlName="rol">
              @for (role of roles; track role) {
                <option [value]="role">{{ roleLabel(role) }}</option>
              }
            </select>
          </label>
          <div class="form-actions">
            <button type="submit" class="primary-button" [disabled]="isSaving()">
              {{ isSaving() ? 'Creando...' : 'Crear usuario' }}
            </button>
          </div>
        </form>
      </section>

      <section class="management-panel" aria-labelledby="users-list-title">
        <div class="list-heading">
          <h2 id="users-list-title">Cuentas registradas</h2>
          <label class="search-field">
            <span class="visually-hidden">Buscar usuario</span>
            <input
              type="search"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              placeholder="Buscar por nombre o correo..."
            />
          </label>
        </div>

        @if (isLoading()) {
          <p class="list-status" role="status">Cargando usuarios...</p>
        } @else if (filteredUsers().length === 0) {
          <p class="list-status">No se encontraron usuarios.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Acceso</th>
                  <th scope="col">Administrar</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr>
                    <td>
                      <strong>{{ user.nombre }} {{ user.apellidos || '' }}</strong>
                      <small>{{ user.email }}</small>
                    </td>
                    <td>
                      @if (user.id === currentUserId()) {
                        <span class="role-badge">{{ roleLabel(user.rol) }}</span>
                      } @else {
                        <label class="visually-hidden" [for]="'role-' + user.id">
                          Rol para {{ user.nombre }}
                        </label>
                        <select
                          [id]="'role-' + user.id"
                          [value]="selectedRole(user)"
                          [disabled]="savingUserId() === user.id"
                          (change)="changeSelectedRole(user, $event)"
                        >
                          @for (role of roles; track role) {
                            <option [value]="role">{{ roleLabel(role) }}</option>
                          }
                        </select>
                      }
                    </td>
                    <td>
                      <span class="access-badge" [class.access-badge--off]="!user.activo">
                        {{ user.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="row-actions">
                      @if (user.id !== currentUserId()) {
                        @if (selectedRole(user) !== user.rol) {
                          <button
                            type="button"
                            class="text-button"
                            [disabled]="savingUserId() === user.id"
                            (click)="saveRole(user)"
                          >
                            Guardar rol
                          </button>
                        }
                        <button
                          type="button"
                          class="text-button"
                          [disabled]="savingUserId() === user.id"
                          (click)="toggleUser(user)"
                        >
                          {{ user.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                      } @else {
                        <small class="muted">Tu cuenta</small>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </section>
  `,
  styleUrl: './admin-users.page.scss',
})
export class AdminUsersPage {
  private readonly api = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly users = signal<UsuarioAdmin[]>([]);

  protected readonly roles = USER_ROLES;
  protected readonly selectedRoles = signal<Record<string, RolUsuarioAdmin>>({});
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly savingUserId = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchTerm = signal('');
  protected readonly currentUserId = computed(() => this.auth.user()?.id ?? '');
  protected readonly filteredUsers = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    return this.users().filter(
      (user) =>
        `${user.nombre} ${user.apellidos ?? ''}`.toLocaleLowerCase().includes(query) ||
        user.email.toLocaleLowerCase().includes(query),
    );
  });

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', Validators.maxLength(100)],
    telefono: ['', Validators.maxLength(20)],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    rol: ['CLIENTE' as RolUsuarioAdmin, Validators.required],
  });

  constructor() {
    this.loadUsers();
  }

  protected roleLabel(role: RolUsuarioAdmin): string {
    const labels: Record<RolUsuarioAdmin, string> = {
      ADMINISTRADOR: 'Administrador',
      OPERARIO: 'Operario',
      CLIENTE: 'Cliente',
    };
    return labels[role];
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected selectedRole(user: UsuarioAdmin): RolUsuarioAdmin {
    return this.selectedRoles()[user.id] ?? user.rol;
  }

  protected changeSelectedRole(user: UsuarioAdmin, event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    if (USER_ROLES.some((knownRole) => knownRole === role)) {
      this.selectedRoles.update((roles) => ({ ...roles, [user.id]: role as RolUsuarioAdmin }));
    }
  }

  protected createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api
      .createUser({
        ...value,
        nombre: value.nombre.trim(),
        apellidos: value.apellidos.trim(),
        telefono: value.telefono.trim(),
        email: value.email.trim(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('Usuario creado.');
          this.form.reset({
            nombre: '',
            apellidos: '',
            telefono: '',
            email: '',
            contrasena: '',
            rol: 'CLIENTE',
          });
          this.loadUsers();
        },
        error: (error: unknown) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            adminApiErrorMessage(error, 'No se pudo crear el usuario. Revisa los datos.'),
          );
        },
      });
  }

  protected saveRole(user: UsuarioAdmin): void {
    const role = this.selectedRole(user);
    if (user.id === this.currentUserId() || role === user.rol) {
      return;
    }
    const activeAdmins = this.users().filter(
      (current) => current.rol === 'ADMINISTRADOR' && current.activo,
    ).length;
    if (
      user.rol === 'ADMINISTRADOR' &&
      user.activo &&
      role !== 'ADMINISTRADOR' &&
      activeAdmins <= 1
    ) {
      this.errorMessage.set('No se puede quitar el rol del único administrador activo.');
      return;
    }

    this.savingUserId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api
      .updateUser(user.id, {
        nombre: user.nombre,
        email: user.email,
        rol: role,
        contrasena: '',
      })
      .subscribe({
        next: (updatedUser) => {
          this.users.update((users) =>
            users.map((current) => (current.id === updatedUser.id ? updatedUser : current)),
          );
          this.selectedRoles.update((roles) => {
            const updated = { ...roles };
            delete updated[user.id];
            return updated;
          });
          this.savingUserId.set(null);
          this.successMessage.set('Rol actualizado.');
        },
        error: (error: unknown) => {
          this.savingUserId.set(null);
          this.errorMessage.set(
            adminApiErrorMessage(error, 'No se pudo actualizar el rol del usuario.'),
          );
        },
      });
  }

  protected toggleUser(user: UsuarioAdmin): void {
    if (user.id === this.currentUserId()) {
      return;
    }
    const activeAdmins = this.users().filter(
      (current) => current.rol === 'ADMINISTRADOR' && current.activo,
    ).length;
    if (user.activo && user.rol === 'ADMINISTRADOR' && activeAdmins <= 1) {
      this.errorMessage.set('No se puede desactivar al único administrador activo.');
      return;
    }
    const action = user.activo ? 'desactivar' : 'activar';
    if (
      !window.confirm(
        `¿${action[0].toLocaleUpperCase()}${action.slice(1)} la cuenta de ${user.nombre}?`,
      )
    ) {
      return;
    }

    this.savingUserId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.setUserActive(user.id, !user.activo).subscribe({
      next: (updatedUser) => {
        this.users.update((users) =>
          users.map((current) => (current.id === updatedUser.id ? updatedUser : current)),
        );
        this.savingUserId.set(null);
        this.successMessage.set(`Cuenta ${updatedUser.activo ? 'activada' : 'desactivada'}.`);
      },
      error: (error: unknown) => {
        this.savingUserId.set(null);
        this.errorMessage.set(
          adminApiErrorMessage(error, 'No se pudo cambiar el acceso del usuario.'),
        );
      },
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.api.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(adminApiErrorMessage(error, 'No se pudieron cargar los usuarios.'));
        this.isLoading.set(false);
      },
    });
  }
}
