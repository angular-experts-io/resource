import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'showcase-todo-skeleton',
  imports: [CommonModule, MatCardModule],
  template: `
    @for (_ of [].constructor(repeat()); track $index) {
      <mat-card class="mb-4 p-4">
        <div class="animate-pulse flex items-center justify-between w-full">
          <!-- Left part: Placeholder for checkbox/icon and description -->
          <div class="flex items-center gap-3 w-full">
            <!-- Checkbox placeholder -->
            <div class="h-6 w-6 bg-gray-300 rounded"></div>
            <!-- Description placeholder -->
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <!-- Right part: Placeholders for two icon buttons -->
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 bg-gray-300 rounded-full"></div> <!-- Placeholder for edit icon button -->
            <div class="h-8 w-8 bg-gray-300 rounded-full"></div> <!-- Placeholder for delete icon button -->
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
