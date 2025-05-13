import { ChangeDetectionStrategy, Component } from '@angular/core';

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
export default class TodoSkeletonComponent {

}
