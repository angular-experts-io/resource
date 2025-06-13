# Project Guidelines

Follow modern Angular syntax and best practices like

* use zone-less change detection and OnPush components
* when changing something, always perform immutable update and use immutable array APIs
* make sure to keep components as lean as possible and move any real logic to services
* always use new Angular control flow with @if, @else, @for, @switch, @case, @let and never use `ngIf`, `ngFor`, `ngSwitch`, and directives where new Angular control flow can be used
* use signals to consume data in template exclusively, this means there won't be any `async` pipes in the template
* use Angular signals and signal-based APIs, eg `viewChild` instead of `@ViewChild` or `output` instead of `@Output`
* use Angular schematics using `ng generate` to generate new files, that way you will follow prescribed conventions from angular.json
* always escape characters like `@` (when part of text, not part of official API like `@if`, `@for`, ... ) in the template with `&#64;` because this is now Angular reserved character
* whenever you do changes on a file, run `prettier`


## Imports styles
* when adding imports to file (and component imports array), always follow this order
* make sure to separate groups of imports with empty line (for main file imports, but NOT in the Angular component imports array)

1. group 1 - vendor
   a. first non-angular imports, like `lodash`, `date-fns`, etc.
   b. angular imports, like `@angular/core`, `@angular/common`, material, cdk,
   c. Angular related imports like `@ngrx/store`, `@ngrx/effects`, `@angular/router`, etc.
   d. RxJS imports like `rxjs` (never use `/operators`)
   e. other Angular related imports
2. group 2 - local vendor (based on TS config paths)
3. group 3 - "deep" application imports, eg across architectural boundary, eg from `core`, `model`, `ui`, ... 
4. group 4 - local imports, eg if the file is in `ui` folder, then imports from `ui` folder, if the file is in `core` folder, then imports from `core` folder, etc.

For the Angular component imports array
1. vendor imports
2. local vendor imports
3. "deep" application imports
4. local imports

Then within the single group, always sort the imports by the line length, if it has too much length so that it breaks on multiple lines, those are always before the single line ones

### Example

```typescript
import { 
  ChangeDetectionStrategy, 
  Component, 
  signal, 
  inject 
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { restResource } from '@angular-experts/resource';

import { Todo } from '../../../model/todo.model';
import { TodoItemComponent } from '../../../ui/todo-item/todo-item.component';
import { TodoSkeletonComponent } from '../../../ui/todo-skeleton/todo-skeleton.component';
```
