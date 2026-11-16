import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminDataService,
  adminApiErrorMessage,
  CategoriaAdmin,
} from '../services/admin-data.service';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="admin-section">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Organización del catálogo</p>
          <h1>Categorías</h1>
          <p>Ordena los productos para que tus clientes encuentren lo que buscan.</p>
        </div>
        <span class="item-count">{{ categories().length }} categorías</span>
      </header>

      @if (errorMessage()) {
        <p class="notice notice--error" role="alert">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="notice notice--success" role="status">{{ successMessage() }}</p>
      }

      @if (canManageCatalog()) {
        <section class="management-panel" aria-labelledby="category-form-title">
          <p class="eyebrow">{{ editingCategory() ? 'Edición' : 'Nuevo registro' }}</p>
          <h2 id="category-form-title">
            {{ editingCategory() ? 'Editar categoría' : 'Agregar categoría' }}
          </h2>
          <form [formGroup]="form" (ngSubmit)="saveCategory()" class="category-form">
            <label>
              <span>Nombre *</span>
              <input formControlName="nombre" maxlength="50" />
              @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
                <small class="field-error">Ingresa un nombre de hasta 50 caracteres.</small>
              }
            </label>
            <label>
              <span>Descripción</span>
              <input formControlName="descripcion" maxlength="200" />
            </label>
            <div class="form-actions">
              <button type="submit" class="primary-button" [disabled]="isSaving()">
                {{
                  isSaving()
                    ? 'Guardando...'
                    : editingCategory()
                      ? 'Guardar cambios'
                      : 'Agregar categoría'
                }}
              </button>
              @if (editingCategory()) {
                <button type="button" class="secondary-button" (click)="cancelEdit()">
                  Cancelar
                </button>
              }
            </div>
          </form>
        </section>
      } @else {
        <p class="permission-note">
          Puedes consultar las categorías. Solo el administrador puede modificarlas.
        </p>
      }

      <section class="category-grid" aria-label="Categorías registradas">
        @if (isLoading()) {
          <p role="status">Cargando categorías...</p>
        } @else if (categories().length === 0) {
          <p>No hay categorías registradas.</p>
        } @else {
          @for (category of categories(); track category.id) {
            <article class="category-card">
              <span class="category-mark" aria-hidden="true">◈</span>
              <div class="category-copy">
                <h2>{{ category.nombre }}</h2>
                <p>{{ category.descripcion || 'Sin descripción.' }}</p>
              </div>
              @if (canManageCatalog()) {
                <div class="category-actions">
                  <button type="button" class="text-button" (click)="editCategory(category)">
                    Editar
                  </button>
                  <button
                    type="button"
                    class="text-button text-button--danger"
                    (click)="deleteCategory(category)"
                  >
                    Eliminar
                  </button>
                </div>
              }
            </article>
          }
        }
      </section>
    </section>
  `,
  styleUrl: './admin-categories.page.scss',
})
export class AdminCategoriesPage {
  private readonly api = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly categories = signal<CategoriaAdmin[]>([]);
  protected readonly editingCategory = signal<CategoriaAdmin | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly canManageCatalog = computed(() => this.auth.hasRole('ADMINISTRADOR'));

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', Validators.maxLength(200)],
  });

  constructor() {
    this.loadCategories();
  }

  protected editCategory(category: CategoriaAdmin): void {
    this.editingCategory.set(category);
    this.form.setValue({
      nombre: category.nombre,
      descripcion: category.descripcion ?? '',
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected cancelEdit(): void {
    this.editingCategory.set(null);
    this.form.reset({ nombre: '', descripcion: '' });
    this.errorMessage.set('');
  }

  protected saveCategory(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const category = this.editingCategory();
    const value = this.form.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api
      .saveCategory(category?.id ?? null, {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set(category ? 'Categoría actualizada.' : 'Categoría agregada.');
          this.editingCategory.set(null);
          this.form.reset({ nombre: '', descripcion: '' });
          this.loadCategories();
        },
        error: (error: unknown) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            adminApiErrorMessage(error, 'No se pudo guardar la categoría. Revisa los datos.'),
          );
        },
      });
  }

  protected deleteCategory(category: CategoriaAdmin): void {
    if (!window.confirm(`¿Eliminar la categoría "${category.nombre}"?`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.successMessage.set('Categoría eliminada.');
        if (this.editingCategory()?.id === category.id) {
          this.cancelEdit();
        }
        this.loadCategories();
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          adminApiErrorMessage(
            error,
            'No se pudo eliminar la categoría. Comprueba que no tenga productos asociados.',
          ),
        );
      },
    });
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.api.listCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(adminApiErrorMessage(error, 'No se pudieron cargar las categorías.'));
        this.isLoading.set(false);
      },
    });
  }
}
