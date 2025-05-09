import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-basic',
  imports: [],
  template: `
    <h2>Basic</h2>
    <div class="mt-8 flex flex-col gap-8">
      <div>
        <h3>Todo list</h3>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BasicComponent {}
