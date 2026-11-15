import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.getToken()) {
    return true;
  }
  return inject(Router).createUrlTree(['/ingresar'], { queryParams: { redirect: state.url } });
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.getToken() ? inject(Router).createUrlTree(['/']) : true;
};

export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.getToken()) {
      return router.createUrlTree(['/ingresar'], { queryParams: { redirect: state.url } });
    }
    return auth.hasRole(...roles) ? true : router.createUrlTree(['/']);
  };

export function safeRedirect(url: string | null | undefined): string {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) {
    return '/';
  }
  if (url.startsWith('/ingresar') || url.startsWith('/registro')) {
    return '/';
  }
  return url;
}
