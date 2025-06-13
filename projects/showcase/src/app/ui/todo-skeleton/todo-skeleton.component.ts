import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'showcase-todo-skeleton',
  template: `
    <div class="flex flex-col gap-4">
      @for (_ of [].constructor(repeat()); track $index) {
        <div class="card flex items-center justify-between">
          <div
            class="flex flex-grow animate-pulse items-center justify-between"
          >
            <!-- Left part: Placeholder for checkbox/icon and description -->
            <div class="flex flex-grow items-center gap-6">
              <!-- Checkbox placeholder -->
              <div class="h-6 w-6 rounded bg-gray-300 dark:bg-gray-700"></div>
              <!-- Description placeholder -->
              <div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
            <!-- Right part: Placeholders for two icon buttons -->
            <div class="flex items-center gap-2">
              <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoSkeletonComponent {
  repeat = input(1);
}
