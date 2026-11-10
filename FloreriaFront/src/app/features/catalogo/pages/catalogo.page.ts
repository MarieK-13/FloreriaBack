import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Product, ProductCategory } from '../../../shared/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { UiButton } from '../../../shared/components/ui-button/ui-button';
import { CatalogService } from '../services/catalog.service';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type FilterGroup = 'flowerTypes' | 'colors' | 'sizes' | 'occasions';

@Component({
  selector: 'app-catalogo-page',
  imports: [ProductCard, RouterLink, UiButton],
  template: `
    <div class="catalog-page page-width">
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a routerLink="/">Inicio</a>
        <span aria-hidden="true">/</span>
        <span>Catálogo</span>
        @if (selectedCategoryName()) {
          <span aria-hidden="true">/</span>
          <strong>{{ selectedCategoryName() }}</strong>
        }
      </nav>

      <header class="catalog-heading">
        <div>
          <p class="eyebrow">Flores frescas para cada ocasión</p>
          <h1>{{ selectedCategoryName() || 'Catálogo' }}</h1>
          <p>Encuentra el arreglo ideal para compartir un momento especial.</p>
        </div>
        <label class="sort-control">
          <span>Ordenar por</span>
          <select [value]="sortBy()" (change)="setSort($event)">
            <option value="recommended">Recomendado</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name-asc">Nombre: A – Z</option>
            <option value="name-desc">Nombre: Z – A</option>
            <option value="recent" disabled title="El catálogo aún no incluye la fecha de registro">
              Más recientes
            </option>
          </select>
        </label>
      </header>

      @if (isLoading()) {
        <p class="state-message" role="status">Cargando catálogo...</p>
      } @else if (loadError()) {
        <div class="state-message state-message--error" role="alert">
          <p>{{ loadError() }}</p>
          <app-ui-button variant="outline" (click)="loadCatalog()">Volver a intentar</app-ui-button>
        </div>
      } @else {
        <div class="catalog-layout">
          <aside class="filters" aria-label="Filtros del catálogo">
            <div class="filter-title">
              <h2>Filtros</h2>
              <button type="button" class="text-button" (click)="clearFilters()">Limpiar</button>
            </div>

            <section class="filter-group">
              <h3>Categorías</h3>
              <button
                type="button"
                class="category-option"
                [class.category-option--selected]="!categoryId()"
                (click)="selectCategory('')"
              >
                <span>Todas</span>
                <span>{{ products().length }}</span>
              </button>
              @for (category of categories(); track category.id) {
                <button
                  type="button"
                  class="category-option"
                  [class.category-option--selected]="categoryId() === category.id"
                  (click)="selectCategory(category.id)"
                >
                  <span>{{ category.name }}</span>
                  <span>{{ countByCategory(category.id) }}</span>
                </button>
              }
            </section>

            <section class="filter-group">
              <h3>Tipo de flor</h3>
              <input
                class="flower-search"
                type="search"
                placeholder="Buscar flor..."
                aria-label="Buscar por tipo de flor"
                [value]="flowerSearch()"
                (input)="setFlowerSearch($event)"
              />
              @for (flower of flowerTypes; track flower) {
                <label class="check-option">
                  <input
                    type="checkbox"
                    [checked]="flowerTypesSelected().includes(flower)"
                    (change)="toggleFilter('flowerTypes', flower)"
                  />
                  <span>{{ flower }}</span>
                </label>
              }
            </section>

            <section class="filter-group">
              <h3>Color</h3>
              @for (color of availableColors(); track color) {
                <label class="check-option">
                  <input
                    type="checkbox"
                    [checked]="colorsSelected().includes(color)"
                    (change)="toggleFilter('colors', color)"
                  />
                  <span>{{ color }}</span>
                </label>
              } @empty {
                <p class="filter-note">No hay colores registrados.</p>
              }
            </section>

            <section class="filter-group">
              <h3>Tamaño</h3>
              @for (size of availableSizes(); track size) {
                <label class="check-option">
                  <input
                    type="checkbox"
                    [checked]="sizesSelected().includes(size)"
                    (change)="toggleFilter('sizes', size)"
                  />
                  <span>{{ size }}</span>
                </label>
              } @empty {
                <p class="filter-note">No hay tamaños registrados.</p>
              }
            </section>

            <section class="filter-group">
              <h3>Ocasión</h3>
              @for (occasion of availableOccasions(); track occasion) {
                <label class="check-option">
                  <input
                    type="checkbox"
                    [checked]="occasionsSelected().includes(occasion)"
                    (change)="toggleFilter('occasions', occasion)"
                  />
                  <span>{{ occasion }}</span>
                </label>
              } @empty {
                <p class="filter-note">No hay ocasiones registradas en las fichas de producto.</p>
              }
            </section>

            <section class="filter-group">
              <h3>Disponibilidad</h3>
              <label class="check-option">
                <input
                  type="checkbox"
                  [checked]="availableOnly()"
                  (change)="setAvailabilityFilter($event)"
                />
                <span>Solo productos disponibles</span>
              </label>
              <label class="check-option">
                <input
                  type="checkbox"
                  [checked]="campaignOnly()"
                  (change)="setCampaignFilter($event)"
                />
                <span>En campaña o con descuento</span>
              </label>
            </section>

            <section class="filter-group price-filter">
              <h3>Precio</h3>
              <div class="price-inputs">
                <label>
                  <span>Mínimo</span>
                  <input
                    type="number"
                    min="0"
                    [value]="minPrice()"
                    (input)="setMinPrice($event)"
                  />
                </label>
                <label>
                  <span>Máximo</span>
                  <input
                    type="number"
                    min="0"
                    [value]="maxPrice()"
                    (input)="setMaxPrice($event)"
                  />
                </label>
              </div>
              <app-ui-button variant="outline" (click)="applyPriceRange()">Aplicar</app-ui-button>
            </section>
          </aside>

          <section class="results" aria-labelledby="results-title">
            <div class="results-toolbar">
              <p id="results-title">
                Mostrando {{ pageStart() }}–{{ pageEnd() }} de {{ filteredProducts().length }} productos
              </p>
              @if (activeFilterCount() > 0) {
                <button type="button" class="text-button" (click)="clearFilters()">
                  Limpiar filtros ({{ activeFilterCount() }})
                </button>
              }
            </div>

            @if (pagedProducts().length > 0) {
              <div class="product-grid">
                @for (product of pagedProducts(); track product.id) {
                  <app-product-card [product]="product" (add)="addToCart($event)" />
                }
              </div>

              @if (totalPages() > 1) {
                <nav class="pagination" aria-label="Paginación del catálogo">
                  <button
                    type="button"
                    aria-label="Página anterior"
                    [disabled]="currentPage() === 1"
                    (click)="goToPage(currentPage() - 1)"
                  >
                    ‹
                  </button>
                  @for (page of pageNumbers(); track page) {
                    <button
                      type="button"
                      [attr.aria-current]="currentPage() === page ? 'page' : null"
                      [class.pagination-current]="currentPage() === page"
                      (click)="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  }
                  <button
                    type="button"
                    aria-label="Página siguiente"
                    [disabled]="currentPage() === totalPages()"
                    (click)="goToPage(currentPage() + 1)"
                  >
                    ›
                  </button>
                </nav>
              }
            } @else {
              <div class="empty-state">
                <span aria-hidden="true">✿</span>
                <h2>No encontramos productos</h2>
                <p>Prueba cambiando los filtros para ver otros arreglos.</p>
                <app-ui-button variant="outline" (click)="clearFilters()">Limpiar filtros</app-ui-button>
              </div>
            }
            <p class="cart-message" aria-live="polite">{{ cartMessage() }}</p>
          </section>
        </div>
      }
    </div>
  `,
  styleUrl: './catalogo.page.scss',
})
export class CatalogoPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  protected readonly categories = signal<ProductCategory[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly categoryId = signal('');
  protected readonly flowerSearch = signal('');
  protected readonly flowerTypesSelected = signal<string[]>([]);
  protected readonly colorsSelected = signal<string[]>([]);
  protected readonly sizesSelected = signal<string[]>([]);
  protected readonly occasionsSelected = signal<string[]>([]);
  protected readonly availableOnly = signal(false);
  protected readonly campaignOnly = signal(false);
  protected readonly minPrice = signal(0);
  protected readonly maxPrice = signal(150);
  protected readonly sortBy = signal<SortOption>('recommended');
  protected readonly currentPage = signal(1);
  protected readonly cartMessage = signal('');
  protected readonly flowerTypes = ['Rosas', 'Girasoles', 'Tulipanes', 'Orquídeas'];
  private readonly pageSize = 9;

  protected readonly selectedCategoryName = computed(
    () => this.categories().find((category) => category.id === this.categoryId())?.name ?? '',
  );
  protected readonly availableColors = computed(() =>
    this.uniqueValues(this.products().map((product) => product.color)),
  );
  protected readonly availableSizes = computed(() =>
    this.uniqueValues(this.products().map((product) => product.size)),
  );
  protected readonly availableOccasions = computed(() =>
    this.uniqueValues(
      this.products().flatMap((product) => product.occasion.split(/[,;|]/).map((value) => value.trim())),
    ),
  );
  protected readonly filteredProducts = computed(() => {
    const search = this.flowerSearch().trim().toLocaleLowerCase('es');
    let result = this.products().filter((product) => {
      const flowerName = `${product.name} ${product.category}`.toLocaleLowerCase('es');
      const occasionValues = product.occasion
        .split(/[,;|]/)
        .map((value) => value.trim().toLocaleLowerCase('es'));
      const campaignMatch = /campaña|descuento/i.test(product.description);

      return (
        (!this.categoryId() || product.categoryId === this.categoryId()) &&
        (!search || flowerName.includes(search)) &&
        (!this.flowerTypesSelected().length ||
          this.flowerTypesSelected().some((flower) => flowerName.includes(flower.toLocaleLowerCase('es')))) &&
        (!this.colorsSelected().length || this.colorsSelected().includes(product.color)) &&
        (!this.sizesSelected().length || this.sizesSelected().includes(product.size)) &&
        (!this.occasionsSelected().length ||
          this.occasionsSelected().some((occasion) =>
            occasionValues.includes(occasion.toLocaleLowerCase('es')),
          )) &&
        (!this.availableOnly() || product.available) &&
        (!this.campaignOnly() || campaignMatch) &&
        product.price >= this.minPrice() &&
        product.price <= this.maxPrice()
      );
    });

    switch (this.sortBy()) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      case 'name-desc':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name, 'es'));
        break;
    }

    return result;
  });
  protected readonly totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.pageSize),
  );
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );
  protected readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });
  protected readonly pageStart = computed(() =>
    this.filteredProducts().length ? (this.currentPage() - 1) * this.pageSize + 1 : 0,
  );
  protected readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredProducts().length),
  );
  protected readonly activeFilterCount = computed(
    () =>
      Number(Boolean(this.categoryId())) +
      this.flowerTypesSelected().length +
      this.colorsSelected().length +
      this.sizesSelected().length +
      this.occasionsSelected().length +
      Number(this.availableOnly()) +
      Number(this.campaignOnly()) +
      Number(this.minPrice() > 0 || this.maxPrice() < 150),
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const requestedCategory = params.get('categoria') ?? '';
      const category = this.categories().find(
        (item) =>
          item.id === requestedCategory ||
          item.name.toLocaleLowerCase('es') === requestedCategory.toLocaleLowerCase('es'),
      );
      this.categoryId.set(category?.id ?? '');
      this.occasionsSelected.set(params.get('ocasion') ? [params.get('ocasion')!] : []);
      this.currentPage.set(1);
    });
    this.loadCatalog();
  }

  protected loadCatalog(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.catalogService.getCatalog().subscribe({
      next: (catalog) => {
        this.categories.set(catalog.categories);
        this.products.set(catalog.products);
        const requestedCategory = this.route.snapshot.queryParamMap.get('categoria') ?? '';
        const category = catalog.categories.find(
          (item) =>
            item.id === requestedCategory ||
            item.name.toLocaleLowerCase('es') === requestedCategory.toLocaleLowerCase('es'),
        );
        this.categoryId.set(category?.id ?? '');
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el catálogo. Verifica la conexión con el backend.');
        this.isLoading.set(false);
      },
    });
  }

  protected countByCategory(categoryId: string): number {
    return this.products().filter((product) => product.categoryId === categoryId).length;
  }

  protected selectCategory(categoryId: string): void {
    this.categoryId.set(categoryId);
    this.currentPage.set(1);
  }

  protected toggleFilter(group: FilterGroup, value: string): void {
    const selected = this[`${group}Selected` as const];
    selected.update((values) =>
      values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    );
    this.currentPage.set(1);
  }

  protected setFlowerSearch(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.flowerSearch.set(target.value);
      this.currentPage.set(1);
    }
  }

  protected setMinPrice(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.minPrice.set(Math.max(0, Number(target.value) || 0));
      this.currentPage.set(1);
    }
  }

  protected setMaxPrice(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.maxPrice.set(Math.max(0, Number(target.value) || 0));
      this.currentPage.set(1);
    }
  }

  protected setAvailabilityFilter(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.availableOnly.set(target.checked);
      this.currentPage.set(1);
    }
  }

  protected setCampaignFilter(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.campaignOnly.set(target.checked);
      this.currentPage.set(1);
    }
  }

  protected setSort(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const value = target.value;
      if (
        value === 'recommended' ||
        value === 'price-asc' ||
        value === 'price-desc' ||
        value === 'name-asc' ||
        value === 'name-desc'
      ) {
        this.sortBy.set(value);
      }
      this.currentPage.set(1);
    }
  }

  protected applyPriceRange(): void {
    if (this.maxPrice() < this.minPrice()) {
      this.maxPrice.set(this.minPrice());
    }
    this.currentPage.set(1);
  }

  protected clearFilters(): void {
    this.categoryId.set('');
    this.flowerSearch.set('');
    this.flowerTypesSelected.set([]);
    this.colorsSelected.set([]);
    this.sizesSelected.set([]);
    this.occasionsSelected.set([]);
    this.availableOnly.set(false);
    this.campaignOnly.set(false);
    this.minPrice.set(0);
    this.maxPrice.set(150);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  protected addToCart(product: Product): void {
    this.cartService.addProduct(product);
    this.cartMessage.set(
      product.available
        ? `${product.name} se añadió al carrito.`
        : `${product.name} no está disponible.`,
    );
  }

  private uniqueValues(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }
}
