import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'showcase-todo-skeleton',
  imports: [MatCardModule],
  template: `
    @for (_ of [].constructor(repeat()); track $index) {
      <mat-card class="mb-4 p-4">
        <div class="flex w-full animate-pulse items-center justify-between">
          <!-- Left part: Placeholder for checkbox/icon and description -->
          <div class="flex w-full items-center gap-3">
            <!-- Checkbox placeholder -->
            <div class="h-6 w-6 rounded bg-gray-300"></div>
            <!-- Description placeholder -->
            <div class="h-4 w-3/4 rounded bg-gray-300"></div>
          </div>
          <!-- Right part: Placeholders for two icon buttons -->
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full bg-gray-300"></div>
            <!-- Placeholder for edit icon button -->
            <div class="h-8 w-8 rounded-full bg-gray-300"></div>
            <!-- Placeholder for delete icon button -->
          </div>
        </div>
      </mat-card>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%; /* Ensure it takes full width available */
    }
    /* Tailwind will be used for inline classes, but if specific :host styling is needed, it goes here */
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoSkeletonComponent {
  repeat = input(1);
}
