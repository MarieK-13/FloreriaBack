import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
