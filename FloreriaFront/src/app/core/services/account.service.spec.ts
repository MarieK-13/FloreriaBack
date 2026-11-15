import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../api/api.config';
import { AuthResponse } from '../models/auth.model';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';

const sesion: AuthResponse = {
  token: 'token-1',
  tipo: 'Bearer',
  expiraEnMs: 60_000,
  usuarioId: 'u-1',
  nombre: 'Ana',
  email: 'ana@test.com',
  rol: 'CLIENTE',
};

describe('AccountService', () => {
  let account: AccountService;
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    account = TestBed.inject(AccountService);
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    // Inicia sesión antes de cada prueba
    auth.login({ email: 'ana@test.com', contrasena: 'Clave123' }, true).subscribe();
    http.expectOne(`${API_BASE_URL}/auth/login`).flush(sesion);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('getProfile consulta GET /api/auth/me', () => {
    account.getProfile().subscribe();
    expect(http.expectOne(`${API_BASE_URL}/auth/me`).request.method).toBe('GET');
  });

  it('updateProfile envía PUT y actualiza el nombre del encabezado', () => {
    account
      .updateProfile({
        nombre: ' Ana María ',
        apellidos: 'Torres',
        telefono: '987654321',
        distrito: 'Ica',
        direccion: ' Av. Grau 123 ',
      })
      .subscribe();

    const req = http.expectOne(`${API_BASE_URL}/auth/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.nombre).toBe('Ana María');
    expect(req.request.body.direccion).toBe('Av. Grau 123');
    req.flush({ ...sesion, id: 'u-1', nombre: 'Ana María', apellidos: 'Torres' });

    expect(auth.user()?.name).toBe('Ana María');
  });

  it('changePassword envía PUT /api/auth/me/contrasena', () => {
    account
      .changePassword({
        contrasenaActual: 'a',
        nuevaContrasena: 'Nueva456',
        confirmacion: 'Nueva456',
      })
      .subscribe();
    const req = http.expectOne(`${API_BASE_URL}/auth/me/contrasena`);
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('changeEmail guarda el token nuevo', () => {
    let nuevoCorreo = '';
    account
      .changeEmail({ nuevoEmail: ' nueva@test.com ', contrasenaActual: 'Clave123' })
      .subscribe((email) => (nuevoCorreo = email));

    const req = http.expectOne(`${API_BASE_URL}/auth/me/email`);
    expect(req.request.body.nuevoEmail).toBe('nueva@test.com');
    req.flush({ ...sesion, token: 'token-2', email: 'nueva@test.com' });

    expect(nuevoCorreo).toBe('nueva@test.com');
    expect(auth.getToken()).toBe('token-2');
    expect(auth.user()?.email).toBe('nueva@test.com');
    expect(localStorage.getItem('floriasmart.session')).toContain('token-2');
  });

  it('deleteAccount envía DELETE con la contraseña y cierra la sesión', () => {
    account.deleteAccount('Clave123').subscribe();

    const req = http.expectOne(`${API_BASE_URL}/auth/me`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ contrasena: 'Clave123' });
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(auth.isLoggedIn()).toBe(false);
  });

  it('si la contraseña es incorrecta (400) no cierra la sesión', () => {
    account.deleteAccount('mala').subscribe({ error: () => undefined });
    http
      .expectOne(`${API_BASE_URL}/auth/me`)
      .flush(
        { mensaje: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );

    expect(auth.isLoggedIn()).toBe(true);
  });
});
