import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-behavior',
  imports: [],
  template: `
    <h2 class="text-4xl font-bold">Behavior</h2>
    <p>
      behavior works!
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BehaviorComponent {

}
