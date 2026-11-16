import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/services/auth.service';
import { AdminCategoriesPage } from './admin-categories.page';

describe('AdminCategoriesPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoriesPage],
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

  it('crea una categoría y actualiza la lista', async () => {
    const fixture = TestBed.createComponent(AdminCategoriesPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/categorias`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector(
      'input[formControlName="nombre"]',
    ) as HTMLInputElement;
    name.value = 'Ramos';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    const description = fixture.nativeElement.querySelector(
      'input[formControlName="descripcion"]',
    ) as HTMLInputElement;
    description.value = 'Ramos frescos';
    description.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const createRequest = http.expectOne(`${API_BASE_URL}/categorias`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ nombre: 'Ramos', descripcion: 'Ramos frescos' });
    createRequest.flush({ id: 'category-1', nombre: 'Ramos', descripcion: 'Ramos frescos' });
    http
      .expectOne(`${API_BASE_URL}/categorias`)
      .flush([{ id: 'category-1', nombre: 'Ramos', descripcion: 'Ramos frescos' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Categoría agregada.');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ramos');
  });
});
