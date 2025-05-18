import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadChildren: () => import('./feature/home/home.routes'),
  },
  {
    path: 'example',
    loadChildren: () => import('./feature/example/example.routes'),
  },
  {
    path: 'doc',
    loadChildren: () => import('./feature/doc/doc.routes'),
  },
];
