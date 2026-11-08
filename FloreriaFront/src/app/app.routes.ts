import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home.page').then((module) => module.HomePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
