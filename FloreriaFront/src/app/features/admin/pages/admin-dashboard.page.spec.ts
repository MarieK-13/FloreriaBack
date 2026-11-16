import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/services/auth.service';
import { AdminDashboardPage } from './admin-dashboard.page';

describe('AdminDashboardPage', () => {
  let http: HttpTestingController;
  let isAdministrator: boolean;

  beforeEach(async () => {
    registerLocaleData(localeEsPe);
    isAdministrator = true;
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        { provide: AuthService, useValue: { hasRole: () => isAdministrator } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('carga métricas y solo incluye pedidos pagados en el ranking de productos', async () => {
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();

    const salesRequest = http.expectOne(
      (request) => request.url === `${API_BASE_URL}/pedidos/reportes/ventas`,
    );
    const ordersRequest = http.expectOne(
      (request) => request.url === `${API_BASE_URL}/pedidos/reportes/rango`,
    );
    expect(salesRequest.request.params.get('inicio')).toBeTruthy();
    expect(salesRequest.request.params.get('fin')).toBeTruthy();
    expect(ordersRequest.request.params.get('inicio')).toBe(
      salesRequest.request.params.get('inicio'),
    );
    expect(ordersRequest.request.params.get('fin')).toBe(salesRequest.request.params.get('fin'));

    salesRequest.flush({
      fechaInicio: '2026-11-01',
      fechaFin: '2026-11-15',
      cantidadPedidos: 2,
      totalVendido: 150,
    });
    ordersRequest.flush([
      {
        id: 'pedido-00000001',
        fechaPedido: '2026-11-15T12:00:00',
        total: 100,
        estado: 'PAGADO',
        usuarioNombre: 'Ana Flores',
        detalles: [
          {
            productoId: 'producto-1',
            productoNombre: 'Ramo de rosas',
            cantidad: 2,
            subtotal: 100,
          },
        ],
      },
      {
        id: 'pedido-00000002',
        fechaPedido: '2026-11-14T12:00:00',
        total: 50,
        estado: 'PENDIENTE',
        usuarioNombre: 'Luis Jardín',
        detalles: [
          {
            productoId: 'producto-2',
            productoNombre: 'Ramo de tulipanes',
            cantidad: 1,
            subtotal: 50,
          },
        ],
      },
      {
        id: 'pedido-00000003',
        fechaPedido: '2026-11-13T12:00:00',
        total: 500,
        estado: 'CANCELADO',
        usuarioNombre: 'Cliente cancelado',
        detalles: [
          {
            productoId: 'producto-3',
            productoNombre: 'Producto cancelado',
            cantidad: 20,
            subtotal: 500,
          },
        ],
      },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Pedidos del período');
    expect(text).toContain('Ramo de rosas');
    expect(text).toContain('2 unidades vendidas');
    expect(text).toContain('Pedidos abiertos');
    expect(text).not.toContain('Producto cancelado');
    expect(text).not.toContain('Ramo de tulipanes');
    expect(text).toContain('Ana Flores');
  });

  it('calcula el resumen del operario desde los pedidos permitidos para su rol', async () => {
    isAdministrator = false;
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();

    const ordersRequest = http.expectOne(`${API_BASE_URL}/pedidos`);
    ordersRequest.flush([
      {
        id: 'pedido-operario-1',
        fechaPedido: '2026-11-15T12:00:00',
        total: 80,
        estado: 'PAGADO',
        usuarioNombre: 'Cliente',
        detalles: [],
      },
      {
        id: 'pedido-operario-3',
        fechaPedido: '2026-11-14T12:00:00',
        total: 40,
        estado: 'PENDIENTE',
        usuarioNombre: 'Pedido sin pagar',
        detalles: [],
      },
      {
        id: 'pedido-operario-2',
        fechaPedido: '2026-10-15T12:00:00',
        total: 900,
        estado: 'PAGADO',
        usuarioNombre: 'Fuera del período',
        detalles: [],
      },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const salesMetric = (fixture.nativeElement as HTMLElement).querySelector(
      '.metric-card--sales',
    ) as HTMLElement;

    expect(text).toContain('80.00');
    expect(text).toContain('Pedidos pagados o retirados');
    expect(salesMetric.textContent).not.toContain('40.00');
    expect(text).not.toContain('Fuera del período');
    http.expectNone((request) => request.url.includes('/reportes/'));
  });
});
