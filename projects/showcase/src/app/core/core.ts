import {
  provideRouter,
  Routes,
  withComponentInputBinding,
} from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  inject,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { apiInterceptor } from './interceptors/api.interceptor';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface CoreOptions {
  routes: Routes;
}

export function provideCore(options: CoreOptions) {
  return [
    provideAnimationsAsync(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    provideRouter(options.routes, withComponentInputBinding()),
    provideEnvironmentInitializer(() => {
      const iconRegistry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);

      ['github', 'npm'].forEach((icon) =>
        iconRegistry.addSvgIcon(
          icon,
          sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`),
        ),
      );
    }),
  ];
}
