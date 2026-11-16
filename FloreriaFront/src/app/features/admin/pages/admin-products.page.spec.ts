import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/services/auth.service';
import { AdminProductsPage } from './admin-products.page';

describe('AdminProductsPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    registerLocaleData(localeEsPe);
    await TestBed.configureTestingModule({
      imports: [AdminProductsPage],
      providers: [
        { provide: AuthService, useValue: { hasRole: () => true } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('crea un producto con los datos del formulario y recarga el catálogo', async () => {
    const fixture = TestBed.createComponent(AdminProductsPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/productos`).flush([]);
    http
      .expectOne(`${API_BASE_URL}/categorias`)
      .flush([{ id: 'category-1', nombre: 'Ramos', descripcion: '' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    const setValue = (selector: string, value: string) => {
      const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue('[formControlName="nombre"]', 'Ramo de prueba');
    setValue('[formControlName="descripcion"]', 'Flores frescas');
    setValue('[formControlName="precio"]', '35.5');
    setValue('[formControlName="stock"]', '4');
    setValue('[formControlName="ocasiones"]', 'Cumpleaños, Aniversario');

    const category = fixture.nativeElement.querySelector(
      'select[formControlName="categoriaId"]',
    ) as HTMLSelectElement;
    category.value = 'category-1';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const createRequest = http.expectOne(`${API_BASE_URL}/productos`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toMatchObject({
      nombre: 'Ramo de prueba',
      descripcion: 'Flores frescas',
      precio: 35.5,
      stock: 4,
      categoriaId: 'category-1',
      ocasiones: ['Cumpleaños', 'Aniversario'],
    });
    createRequest.flush({
      id: 'product-1',
      nombre: 'Ramo de prueba',
      descripcion: 'Flores frescas',
      precio: 35.5,
      stock: 4,
      disponible: true,
      color: null,
      tamano: null,
      imagenUrl: null,
      imagenesGaleria: [],
      ocasiones: ['Cumpleaños', 'Aniversario'],
      componentes: [],
      fechaValidez: null,
      categoriaNombre: 'Ramos',
    });
    http.expectOne(`${API_BASE_URL}/productos`).flush([]);
    http.expectOne(`${API_BASE_URL}/categorias`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Producto agregado.');
  });
});
