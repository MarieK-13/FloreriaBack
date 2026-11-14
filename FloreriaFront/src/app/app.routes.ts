import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
