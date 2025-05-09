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
        title: 'Examples',
        navigation: [
          {
            label: 'Basic',
            route: 'basic',
          },
          {
            label: 'Behavior',
            route: 'behavior',
          },
        ],
      },
    },
    children: [
      {
        path: 'basic',
        loadComponent: () => import('./basic/basic.component'),
      },
      {
        path: 'behavior',
        loadComponent: () => import('./behavior/behavior.component'),
      },
    ],
  },
];
