import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatListItem, MatNavList } from '@angular/material/list';
import { take } from 'rxjs';

export interface FeatureLayoutOptions {
  title: string;
  navigation: { label: string; route: string }[];
}

@Component({
  selector: 'showcase-feature-layout',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    MatIcon,
    MatNavList,
    MatListItem,
    MatIconButton,
  ],
  template: `
    <div class="mb-8 flex items-center gap-4 md:text-center">
      <button
        class="md:hidden!"
        mat-icon-button
        aria-label="Example icon-button with menu icon"
        (click)="openBottomSheet()"
      >
        @if (isBottomSheetOpen()) {
          <mat-icon>close</mat-icon>
        } @else {
          <mat-icon>menu</mat-icon>
        }
      </button>
      <h1 class="text-4xl font-bold">{{ featureLayoutOptions().title }}</h1>
    </div>
    <nav class="grid grid-cols-1 gap-12 md:grid-cols-4 xl:gap-36">
      <div class="hidden md:block">
        <ng-container *ngTemplateOutlet="navigation" />
      </div>
      <div class="col-span-3 pt-3">
        <router-outlet />
      </div>
    </nav>
    <ng-template #navigation>
      <mat-nav-list>
        @for (nav of featureLayoutOptions().navigation; track nav.route) {
          <a
            class="mb-2"
            mat-list-item
            [activated]="rla.isActive"
            [routerLink]="nav.route"
            routerLinkActive
            #rla="routerLinkActive"
          >
            {{ nav.label }}
          </a>
        }
      </mat-nav-list>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FeatureLayoutComponent {
  #bottomSheet = inject(MatBottomSheet);

  featureLayoutOptions = input.required<FeatureLayoutOptions>();

  navigationTplRef = viewChild.required<TemplateRef<object>>('navigation');
  isBottomSheetOpen = signal(false);

  openBottomSheet() {
    // workaround for terrible Angular Material API
    this.isBottomSheetOpen.set(true);
    this.#bottomSheet
      .open(this.navigationTplRef())
      .afterDismissed()
      .pipe(take(1))
      .subscribe(() => {
        this.isBottomSheetOpen.set(false);
      });
  }
}
