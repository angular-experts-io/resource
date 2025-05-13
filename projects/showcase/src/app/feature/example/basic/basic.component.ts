import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { restResource } from '@angular-experts/resource';

import { Todo } from '../../../model/todo.model';

@Component({
  selector: 'showcase-basic',
  imports: [
    MatIcon,
    MatCard,
    MatInput,
    MatFormField,
    MatIconButton,
    MatCardContent,
  ],
  template: `
    <h2>Basic</h2>
    <div class="mt-8 flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h3>Todo list</h3>

        <mat-form-field appearance="outline">
          <input
            #todoDescriptionInputRef
            matInput
            placeholder="What am I going to do..."
            [value]="newTodo()"
            (input)="newTodo.set(todoDescriptionInputRef.value)"
            (keyup.enter)="createTodo()"
          />
        </mat-form-field>

        <div class="flex flex-col gap-4">
          @if (todos.loadingInitial()) {
          } @else {
            @for (todo of todos.values(); track todo.id) {
              <mat-card appearance="outlined">
                <mat-card-content>
                  <div class="flex items-center justify-between gap-4">
                    {{ todo.description }}
                    <button
                      type="button"
                      mat-icon-button
                      (click)="handleRemove(todo)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            } @empty {
              <mat-card appearance="outlined">
                <mat-card-content
                  >No todos found, create some...
                </mat-card-content>
              </mat-card>
            }
          }
        </div>
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
export default class BasicComponent {
  todos = restResource<Todo, 'string'>('todos');

  newTodo = signal('');

  createTodo() {
    const newTodo = this.newTodo();
    if (newTodo.length > 0) {
      this.todos.create({ description: newTodo, completed: false });
    }
    this.newTodo.set('');
  }

  handleRemove(todo: Todo) {
    this.todos.remove(todo);
  }
}
