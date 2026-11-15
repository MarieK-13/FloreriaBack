import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | FloreriaSmart',
    loadComponent: () =>
      import('./features/home/pages/home.page').then((module) => module.HomePage),
  },
  {
    path: 'catalogo',
    title: 'Catálogo | FloriaSmart',
    loadComponent: () =>
      import('./features/catalogo/pages/catalogo.page').then((module) => module.CatalogoPage),
  },
  {
    path: 'catalogo/:id',
    title: 'Detalle del producto | FloriaSmart',
    loadComponent: () =>
      import('./features/catalogo/pages/detalle-producto.page').then(
        (module) => module.DetalleProductoPage,
      ),
  },
  {
    path: 'productos/:id',
    title: 'Producto | FloriaSmart',
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
    path: 'galeria',
    title: 'Galería | FloriaSmart',
    loadComponent: () =>
      import('./features/galeria/pages/galeria.page').then((module) => module.GaleriaPage),
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
    path: 'mis-fechas',
    title: 'Mis fechas | FloriaSmart',
    loadComponent: () =>
      import('./features/mis-fechas/pages/mis-fechas.page').then((m) => m.MisFechasPage),
  },
  {
    path: 'favoritos',
    title: 'Mis Favoritos | FloriaSmart',
    loadComponent: () =>
      import('./features/favoritos/pages/favoritos.page').then((m) => m.FavoritosPage),
  },
  {
    path: 'carrito',
    title: 'Carrito de Compras | FloriaSmart',
    loadComponent: () => import('./features/carrito/pages/carrito.page').then((m) => m.CarritoPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
