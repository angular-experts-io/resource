import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-todo-item',
  imports: [],
  template: `
    <p>
      todo-item works!
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TodoItemComponent {

}
