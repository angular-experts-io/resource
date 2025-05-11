import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component, effect,
  inject,
  linkedSignal,
  signal
} from '@angular/core';

import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import {
  MatAnchor,
  MatIconAnchor,
  MatIconButton,
} from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, of, startWith } from 'rxjs';
import { MatListItem, MatNavList } from '@angular/material/list';
import { DOCUMENT } from '@angular/common';

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
    MatNavList,
    MatListItem,
    MatIconAnchor,
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
  #document = inject(DOCUMENT);
  #breakpointObserver = inject(BreakpointObserver);

  navigation = signal([
    {
      label: 'Home',
      route: 'home',
    },
    {
      label: 'Examples',
      route: 'example',
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

  darkMode = signal<boolean | undefined>(undefined);

  toggleSidenav() {
    this.sidenavOpened.update((prev) => !prev);
  }

  #prefersColorSchemeDarkMedia = this.#document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)',
  );
  #isSystemDarkMode = toSignal(
    this.#prefersColorSchemeDarkMedia
      ? fromEvent<MediaQueryListEvent>(
          this.#prefersColorSchemeDarkMedia,
          'change',
        ).pipe(
          map((event) => event.matches),
          startWith(this.#prefersColorSchemeDarkMedia.matches),
        )
      : of(false),
    { initialValue: false },
  );
  isDarkMode = linkedSignal(this.#isSystemDarkMode);
  #effectSetDarkModeClassOnBody = effect(() => {
    const isDarkMode = this.isDarkMode();
    if (isDarkMode) {
      this.#document.documentElement.classList.remove('light-mode');
      this.#document.documentElement.classList.add('dark-mode');
    } else {
      this.#document.documentElement.classList.remove('dark-mode');
      this.#document.documentElement.classList.add('light-mode');
    }
  })
}
