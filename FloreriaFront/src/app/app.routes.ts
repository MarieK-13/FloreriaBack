import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home.page').then((module) => module.HomePage),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalogo/pages/catalogo.page').then((module) => module.CatalogoPage),
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./features/catalogo/pages/detalle-producto.page').then(
        (module) => module.DetalleProductoPage,
      ),
  },
  {
    path: 'packs/:id',
    loadComponent: () =>
      import('./features/catalogo/pages/detalle-producto.page').then(
        (module) => module.DetalleProductoPage,
      ),
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('./features/nosotros/pages/nosotros.page').then((module) => module.NosotrosPage),
  },
  {
    path: 'ingresar',
    title: 'Iniciar sesión · FloriaSmart',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login.page').then((module) => module.LoginPage),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · FloriaSmart',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/registro.page').then((module) => module.RegistroPage),
  },
  {
    path: 'mi-cuenta',
    title: 'Mi cuenta · FloriaSmart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/pages/mi-cuenta.page').then((module) => module.MiCuentaPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
