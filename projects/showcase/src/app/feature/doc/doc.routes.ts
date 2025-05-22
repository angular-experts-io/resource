import { Routes } from '@angular/router';
import FeatureLayoutComponent, {
  FeatureLayoutOptions,
} from '../../layout/feature-layout/feature-layout.component';

export default <Routes>[
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'basic',
  },
  {
    path: '',
    component: FeatureLayoutComponent,
    data: {
      featureLayoutOptions: <FeatureLayoutOptions>{
        title: 'Docs',
        navigation: [
          {
            label: 'API',
            route: 'api',
          },
        ],
      },
    },
    children: [
      {
        path: 'api',
        loadComponent: () =>
          import('./api/api.component').then((m) => m.ApiComponent),
      },
    ],
  },
];
