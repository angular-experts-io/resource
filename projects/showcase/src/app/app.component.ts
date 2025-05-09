import { Component } from '@angular/core';

import MainLayoutComponent from './layout/main-layout/main-layout.component';

@Component({
  selector: 'showcase-root',
  imports: [MainLayoutComponent],
  template: `<showcase-main-layout />`,
})
export default class AppComponent {}
