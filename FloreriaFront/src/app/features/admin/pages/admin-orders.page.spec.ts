import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AdminOrdersPage } from './admin-orders.page';

describe('AdminOrdersPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    registerLocaleData(localeEsPe);
    await TestBed.configureTestingModule({
      imports: [AdminOrdersPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('actualiza el estado usando una transición permitida', async () => {
    const fixture = TestBed.createComponent(AdminOrdersPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/pedidos`).flush([
      {
        id: 'order-1',
        fechaPedido: '2026-11-15T12:00:00',
        total: 40,
        direccionEntrega: 'Ica',
        instruccionesEntrega: null,
        estado: 'PENDIENTE',
        usuarioId: 'user-1',
        usuarioNombre: 'Ana Flores',
        detalles: [],
      },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const stateSelect = fixture.nativeElement.querySelector(
      'select[id="order-state-order-1"]',
    ) as HTMLSelectElement;
    stateSelect.value = 'EN_PREPARACION';
    stateSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const updateRequest = http.expectOne(
      `${API_BASE_URL}/pedidos/order-1/estado?nuevoEstado=EN_PREPARACION`,
    );
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toBeNull();
    updateRequest.flush({
      id: 'order-1',
      fechaPedido: '2026-11-15T12:00:00',
      total: 40,
      direccionEntrega: 'Ica',
      instruccionesEntrega: null,
      estado: 'EN_PREPARACION',
      usuarioId: 'user-1',
      usuarioNombre: 'Ana Flores',
      detalles: [],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Pedido actualizado a "En preparación".',
    );
  });
});
