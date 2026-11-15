import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AuthService } from '../services/auth.service';

/**
 * Agrega "Authorization: Bearer <token>" a las peticiones hacia nuestra API.
 * Si el backend responde 401 (token vencido o inválido), cierra la sesión y manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const isAuthEndpoint =
    request.url.startsWith(`${API_BASE_URL}/auth/login`) ||
    request.url.startsWith(`${API_BASE_URL}/auth/register`);

  const token = isApiRequest && !isAuthEndpoint ? auth.getToken() : null;
  const authorizedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout(null);
        void router.navigate(['/ingresar'], {
          queryParams: { redirect: router.url, motivo: 'sesion-expirada' },
        });
      }
      return throwError(() => error);
    }),
  );
};
