import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { safeRedirect } from '../guards/auth.guards';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

const respuesta: AuthResponse = {
  token: 'token-de-prueba',
  tipo: 'Bearer',
  expiraEnMs: 60_000,
  usuarioId: '11111111-1111-1111-1111-111111111111',
  nombre: 'María Pérez',
  email: 'maria@test.com',
  rol: 'CLIENTE',
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('inicia sin sesión', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('login guarda el usuario y el token', () => {
    service.login({ email: '  maria@test.com ', contrasena: 'Clave123' }, true).subscribe();

    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'maria@test.com', contrasena: 'Clave123' });
    req.flush(respuesta);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.user()?.name).toBe('María Pérez');
    expect(service.getToken()).toBe('token-de-prueba');
    expect(service.hasRole('CLIENTE')).toBe(true);
    expect(service.hasRole('ADMINISTRADOR')).toBe(false);
    expect(localStorage.getItem('floriasmart.session')).toContain('token-de-prueba');
    expect(sessionStorage.getItem('floriasmart.session')).toBeNull();
  });

  it('sin "Recordarme" la sesión se guarda solo hasta cerrar el navegador', () => {
    service.login({ email: 'maria@test.com', contrasena: 'Clave123' }, false).subscribe();
    http.expectOne('/api/auth/login').flush(respuesta);

    expect(sessionStorage.getItem('floriasmart.session')).toContain('token-de-prueba');
    expect(localStorage.getItem('floriasmart.session')).toBeNull();
  });

  it('register envía nombres, apellidos, email, teléfono, contraseña y términos (sin rol)', () => {
    service
      .register({
        nombre: ' María ',
        apellidos: ' Pérez ',
        email: 'maria@test.com',
        telefono: ' +51 987 654 321 ',
        contrasena: 'Clave123',
        aceptaTerminos: true,
      })
      .subscribe();

    const req = http.expectOne('/api/auth/register');
    expect(req.request.body).toEqual({
      nombre: 'María',
      apellidos: 'Pérez',
      email: 'maria@test.com',
      telefono: '+51 987 654 321',
      contrasena: 'Clave123',
      aceptaTerminos: true,
    });
    req.flush(respuesta, { status: 201, statusText: 'Created' });

    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout borra la sesión', () => {
    service.login({ email: 'maria@test.com', contrasena: 'Clave123' }).subscribe();
    http.expectOne('/api/auth/login').flush(respuesta);

    service.logout(null);

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('floriasmart.session')).toBeNull();
    expect(sessionStorage.getItem('floriasmart.session')).toBeNull();
  });

  it('un token vencido ya no se usa', () => {
    service.login({ email: 'maria@test.com', contrasena: 'Clave123' }).subscribe();
    http.expectOne('/api/auth/login').flush({ ...respuesta, expiraEnMs: -1 });

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('traduce los errores del backend', () => {
    const credenciales = service.toAuthError(
      new HttpErrorResponse({ status: 401, error: { mensaje: 'Email o contraseña incorrectos' } }),
    );
    expect(credenciales.message).toBe('Email o contraseña incorrectos');

    const validacion = service.toAuthError(
      new HttpErrorResponse({ status: 400, error: { errores: { email: 'Formato inválido' } } }),
    );
    expect(validacion.fieldErrors['email']).toBe('Formato inválido');

    const sinConexion = service.toAuthError(new HttpErrorResponse({ status: 0 }));
    expect(sinConexion.message).toContain('No pudimos conectar');
  });
});

describe('safeRedirect', () => {
  it('acepta rutas internas', () => {
    expect(safeRedirect('/catalogo')).toBe('/catalogo');
  });

  it('rechaza destinos externos o vacíos', () => {
    expect(safeRedirect('https://otro-sitio.com')).toBe('/');
    expect(safeRedirect('//otro-sitio.com')).toBe('/');
    expect(safeRedirect(null)).toBe('/');
  });

  it('no regresa al login ni al registro', () => {
    expect(safeRedirect('/ingresar')).toBe('/');
    expect(safeRedirect('/registro?redirect=/x')).toBe('/');
  });
});
