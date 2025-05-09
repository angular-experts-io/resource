import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
  },
];
