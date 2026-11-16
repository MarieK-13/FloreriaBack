import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../favoritos/services/favoritos.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  const createFixture = async (role: UserRole) => {
    const login = vi.fn().mockReturnValue(
      of({
        token: 'token-test',
        tipo: 'Bearer',
        expiraEnMs: 60_000,
        usuarioId: 'usuario-test',
        nombre: 'Usuario de prueba',
        email: 'demo@example.com',
        rol: role,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { login, toAuthError: vi.fn() },
        },
        {
          provide: FavoritosService,
          useValue: { sincronizarYCargarDesdeBackend: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ redirect: '/carrito' }),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginPage);
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('#login-email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#login-password') as HTMLInputElement;
    email.value = 'demo@example.com';
    email.dispatchEvent(new Event('input'));
    password.value = 'Clave123!';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    return { navigateByUrl };
  };

  it('envía al administrador al panel aunque haya un redirect de cliente', async () => {
    const { navigateByUrl } = await createFixture('ADMINISTRADOR');

    expect(navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('envía al operario al panel de administración', async () => {
    const { navigateByUrl } = await createFixture('OPERARIO');

    expect(navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('conserva el redirect solicitado por el cliente', async () => {
    const { navigateByUrl } = await createFixture('CLIENTE');

    expect(navigateByUrl).toHaveBeenCalledWith('/carrito');
  });
});
