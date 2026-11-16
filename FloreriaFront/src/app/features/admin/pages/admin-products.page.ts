import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminDataService,
  adminApiErrorMessage,
  CategoriaAdmin,
  ProductoAdmin,
  ProductoAdminPayload,
} from '../services/admin-data.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule],
  template: `
    <section class="admin-section">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Inventario</p>
          <h1>Productos</h1>
          <p>Administra el catálogo, los precios y las existencias.</p>
        </div>
        <span class="item-count">{{ filteredProducts().length }} productos</span>
      </header>

      @if (errorMessage()) {
        <p class="notice notice--error" role="alert">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="notice notice--success" role="status">{{ successMessage() }}</p>
      }

      @if (canManageCatalog()) {
        <section class="management-panel" aria-labelledby="product-form-title">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">{{ editingProduct() ? 'Edición' : 'Nuevo registro' }}</p>
              <h2 id="product-form-title">
                {{ editingProduct() ? 'Editar producto' : 'Agregar producto' }}
              </h2>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveProduct()" class="product-form">
            <label>
              <span>Nombre *</span>
              <input formControlName="nombre" maxlength="100" />
              @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
                <small class="field-error">Ingresa el nombre del producto.</small>
              }
            </label>
            <label>
              <span>Categoría *</span>
              <select formControlName="categoriaId">
                <option value="">Selecciona una categoría</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.nombre }}</option>
                }
              </select>
              @if (form.controls.categoriaId.touched && form.controls.categoriaId.invalid) {
                <small class="field-error">Selecciona una categoría.</small>
              }
            </label>
            <label class="field-wide">
              <span>Descripción</span>
              <textarea formControlName="descripcion" rows="2" maxlength="500"></textarea>
            </label>
            <label>
              <span>Precio (S/) *</span>
              <input type="number" formControlName="precio" min="0.01" step="0.01" />
              @if (form.controls.precio.touched && form.controls.precio.invalid) {
                <small class="field-error">El precio debe ser mayor que cero.</small>
              }
            </label>
            <label>
              <span>Stock *</span>
              <input type="number" formControlName="stock" min="0" step="1" />
              @if (form.controls.stock.touched && form.controls.stock.invalid) {
                <small class="field-error">El stock no puede ser negativo.</small>
              }
            </label>
            <label>
              <span>Color</span>
              <input formControlName="color" maxlength="50" />
            </label>
            <label>
              <span>Tamaño</span>
              <input formControlName="tamano" maxlength="50" />
            </label>
            <label class="field-wide">
              <span>Ocasiones (separadas por coma)</span>
              <input formControlName="ocasiones" placeholder="Cumpleaños, Aniversario" />
            </label>
            <label class="field-wide">
              <span>URL de imagen</span>
              <input type="url" formControlName="imagenUrl" placeholder="https://..." />
            </label>
            <div class="form-actions field-wide">
              <button type="submit" class="primary-button" [disabled]="isSaving()">
                {{
                  isSaving()
                    ? 'Guardando...'
                    : editingProduct()
                      ? 'Guardar cambios'
                      : 'Agregar producto'
                }}
              </button>
              @if (editingProduct()) {
                <button type="button" class="secondary-button" (click)="cancelEdit()">
                  Cancelar
                </button>
              }
            </div>
          </form>
        </section>
      } @else {
        <p class="permission-note">
          Puedes consultar el inventario. Solo el administrador puede modificar productos.
        </p>
      }

      <section class="management-panel" aria-labelledby="products-list-title">
        <div class="list-heading">
          <h2 id="products-list-title">Catálogo</h2>
          <label class="search-field">
            <span class="visually-hidden">Buscar producto</span>
            <input
              type="search"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              placeholder="Buscar producto..."
            />
          </label>
        </div>

        @if (isLoading()) {
          <p class="list-status" role="status">Cargando productos...</p>
        } @else if (filteredProducts().length === 0) {
          <p class="list-status">No se encontraron productos.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Disponibilidad</th>
                  @if (canManageCatalog()) {
                    <th scope="col">Acciones</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (product of filteredProducts(); track product.id) {
                  <tr>
                    <td>
                      <strong>{{ product.nombre }}</strong>
                      <small>{{ product.color || 'Sin color indicado' }}</small>
                    </td>
                    <td>{{ product.categoriaNombre }}</td>
                    <td>{{ product.precio | currency: 'PEN' : 'symbol' : '1.2-2' : 'es-PE' }}</td>
                    <td>{{ product.stock }}</td>
                    <td>
                      <span class="availability" [class.availability--off]="!product.disponible">
                        {{ product.disponible ? 'Disponible' : 'Agotado' }}
                      </span>
                    </td>
                    @if (canManageCatalog()) {
                      <td class="row-actions">
                        <button type="button" class="text-button" (click)="editProduct(product)">
                          Editar
                        </button>
                        <button
                          type="button"
                          class="text-button text-button--danger"
                          (click)="deleteProduct(product)"
                        >
                          Eliminar
                        </button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </section>
  `,
  styleUrl: './admin-products.page.scss',
})
export class AdminProductsPage {
  private readonly api = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly products = signal<ProductoAdmin[]>([]);

  protected readonly categories = signal<CategoriaAdmin[]>([]);
  protected readonly editingProduct = signal<ProductoAdmin | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchTerm = signal('');
  protected readonly canManageCatalog = computed(() => this.auth.hasRole('ADMINISTRADOR'));
  protected readonly filteredProducts = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    return this.products().filter((product) => product.nombre.toLocaleLowerCase().includes(query));
  });

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    categoriaId: ['', Validators.required],
    descripcion: [''],
    precio: [1, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    color: [''],
    tamano: [''],
    ocasiones: [''],
    imagenUrl: [''],
  });

  constructor() {
    this.loadCatalog();
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected editProduct(product: ProductoAdmin): void {
    this.editingProduct.set(product);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.form.setValue({
      nombre: product.nombre,
      categoriaId:
        this.categories().find((category) => category.nombre === product.categoriaNombre)?.id ?? '',
      descripcion: product.descripcion ?? '',
      precio: product.precio,
      stock: product.stock,
      color: product.color ?? '',
      tamano: product.tamano ?? '',
      ocasiones: (product.ocasiones ?? []).join(', '),
      imagenUrl: product.imagenUrl ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelEdit(): void {
    this.editingProduct.set(null);
    this.form.reset(this.emptyForm());
    this.errorMessage.set('');
  }

  protected saveProduct(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const current = this.editingProduct();
    const payload: ProductoAdminPayload = {
      ...value,
      descripcion: value.descripcion.trim(),
      color: value.color.trim(),
      tamano: value.tamano.trim(),
      imagenUrl: value.imagenUrl.trim(),
      ocasiones: value.ocasiones
        .split(',')
        .map((occasion) => occasion.trim())
        .filter(Boolean),
      imagenesGaleria: current?.imagenesGaleria ?? [],
      componentes: current?.componentes ?? [],
      fechaValidez: current?.fechaValidez ?? null,
    };

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.saveProduct(current?.id ?? null, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(current ? 'Producto actualizado.' : 'Producto agregado.');
        this.editingProduct.set(null);
        this.form.reset(this.emptyForm());
        this.loadCatalog();
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          adminApiErrorMessage(
            error,
            'No se pudo guardar el producto. Revisa los datos e inténtalo otra vez.',
          ),
        );
      },
    });
  }

  protected deleteProduct(product: ProductoAdmin): void {
    if (!window.confirm(`¿Eliminar "${product.nombre}" del catálogo?`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.successMessage.set('Producto eliminado.');
        if (this.editingProduct()?.id === product.id) {
          this.cancelEdit();
        }
        this.loadCatalog();
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          adminApiErrorMessage(error, 'No se pudo eliminar el producto. Inténtalo otra vez.'),
        );
      },
    });
  }

  private loadCatalog(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      products: this.api.listProducts(),
      categories: this.api.listCategories(),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products.set(products);
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          adminApiErrorMessage(error, 'No se pudo cargar el catálogo de productos.'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private emptyForm() {
    return {
      nombre: '',
      categoriaId: '',
      descripcion: '',
      precio: 1,
      stock: 0,
      color: '',
      tamano: '',
      ocasiones: '',
      imagenUrl: '',
    };
  }
}
