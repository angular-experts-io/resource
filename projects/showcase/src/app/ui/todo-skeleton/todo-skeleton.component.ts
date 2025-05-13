import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';


@Component({
  selector: 'showcase-todo-skeleton',
  imports: [],
  template: `
    <p>
      todo-skeleton works!
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoSkeletonComponent {
  repeat = input(1);
}
