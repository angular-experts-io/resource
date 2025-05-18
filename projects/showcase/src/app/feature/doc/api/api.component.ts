import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-api',
  imports: [],
  template: `
    <p>
      api works!
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiComponent {

}
