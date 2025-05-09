import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'showcase-basic',
  imports: [],
  template: `
    <h2 class="text-4xl font-bold">Basic</h2>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
    <p class="my-36">basic works!</p>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class BasicComponent {

}
