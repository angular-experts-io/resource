import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'showcase-main-layout',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    MatIcon,
    MatAnchor,
    MatToolbar,
    MatIconButton,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
  ],
  templateUrl: './main-layout.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainLayoutComponent {
  #breakpointObserver = inject(BreakpointObserver);

  navigation = signal([
    {
      label: 'Home',
      route: 'home',
    },
    {
      label: 'Other',
      route: 'other',
    },
  ]);

  externalLinks = signal([
    {
      icon: 'github',
      url: 'https://github.com/angular-experts-io/resource',
    },
    {
      icon: 'npm',
      url: 'https://www.npmjs.com/package/@angular-experts-io/resource',
    },
  ]);

  isMd = toSignal(
    this.#breakpointObserver
      .observe([
        '(min-width: 768px)', // tailwind md:
      ])
      .pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );

  sidenavOpened = linkedSignal<boolean, boolean>({
    source: this.isMd,
    computation: (isMd, prev) => {
      if (isMd) {
        return false;
      } else {
        return prev?.value ?? false;
      }
    },
  });

  toggleSidenav() {
    this.sidenavOpened.update((prev) => !prev);
  }
}
