import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor, MatIconButton } from '@angular/material/button';

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

  sidenavOpened = signal(false);

  toggleSidenav() {
    this.sidenavOpened.update((prev) => !prev);
  }
}
