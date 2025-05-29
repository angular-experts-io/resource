import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

import { Todo } from '../../model/todo.model';

@Component({
  selector: 'showcase-todo-item',
  imports: [MatIcon, MatIconButton],
  template: `
    <div
      [class.pointer-events-none]="disabled()"
      class="card items-center justify-between cursor-pointer"
      (click)="toggle.emit(t)"
    >
      @let t = todo();
      <div class="flex items-center gap-6">
        <span class="text-2xl">
          @if (t.completed) {
            <mat-icon>check</mat-icon>
          } @else {
            <mat-icon>check_box_outline_blank</mat-icon>
          }
        </span>
        <span
          class="text-lg "
          [class]="
            t.completed
              ? 'text-slate-500 line-through decoration-slate-500'
              : ''
          "
          >{{ t.description }}</span
        >
      </div>
      <div class="flex items-center gap-2" [class.opacity-50]="disabled()">
        <button
          type="button"
          mat-icon-button
          (click)="$event.stopPropagation(); edit.emit(t)"
        >
          <mat-icon>edit</mat-icon>
        </button>
        <button
          type="button"
          mat-icon-button
          (click)="$event.stopPropagation(); remove.emit(t)"
        >
          <mat-icon>delete</mat-icon>
        </button>
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
export class TodoItemComponent {
  todo = input.required<Todo>();
  disabled = input(false);

  toggle = output<Todo>();
  edit = output<Todo>();
  remove = output<Todo>();
}
