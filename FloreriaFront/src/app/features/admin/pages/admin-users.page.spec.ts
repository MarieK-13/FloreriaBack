import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUsersPage } from './admin-users.page';

describe('AdminUsersPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [
        { provide: AuthService, useValue: { user: () => ({ id: 'admin-1' }) } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('actualiza el rol de otra cuenta y deja la cuenta actual protegida', async () => {
    const fixture = TestBed.createComponent(AdminUsersPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/usuarios`).flush([
      {
        id: 'admin-1',
        nombre: 'Admin',
        apellidos: null,
        email: 'admin@example.com',
        telefono: null,
        distrito: null,
        direccion: null,
        rol: 'ADMINISTRADOR',
        activo: true,
      },
      {
        id: 'user-1',
        nombre: 'Cliente',
        apellidos: 'Flores',
        email: 'cliente@example.com',
        telefono: null,
        distrito: null,
        direccion: null,
        rol: 'CLIENTE',
        activo: true,
      },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const currentUserRow = fixture.nativeElement.querySelector('tbody tr') as HTMLElement;
    expect(currentUserRow.textContent).toContain('Tu cuenta');
    const roleSelect = fixture.nativeElement.querySelector('#role-user-1') as HTMLSelectElement;
    roleSelect.value = 'OPERARIO';
    roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    const saveButton = fixture.nativeElement
      .querySelector('#role-user-1')
      ?.parentElement?.parentElement?.querySelector('button') as HTMLButtonElement;
    saveButton.click();

    const updateRequest = http.expectOne(`${API_BASE_URL}/usuarios/user-1`);
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      nombre: 'Cliente',
      email: 'cliente@example.com',
      rol: 'OPERARIO',
      contrasena: '',
    });
    updateRequest.flush({
      id: 'user-1',
      nombre: 'Cliente',
      apellidos: 'Flores',
      email: 'cliente@example.com',
      telefono: null,
      distrito: null,
      direccion: null,
      rol: 'OPERARIO',
      activo: true,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Rol actualizado.');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Operario');
  });
});
