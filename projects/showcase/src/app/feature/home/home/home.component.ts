import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-home',
  imports: [],
  template: ` <p>home works!</p> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
