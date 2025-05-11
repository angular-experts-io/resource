import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

import { restResource } from '@angular-experts/resource';

import { Todo } from '../../../model/todo.model';

@Component({
  selector: 'showcase-basic',
  imports: [MatCard, MatCardContent, MatFormField, MatLabel, MatInput],
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
            [value]="newTodoDescription()"
            (input)="newTodoDescription.set(todoDescriptionInputRef.value)"
            (keyup.enter)="createTodo()"
          />
        </mat-form-field>

        <div class="flex flex-col gap-4">
          @for (todo of todos.values(); track todo.id) {
            <mat-card appearance="outlined">
              <mat-card-content>
                {{todo.description}}
              </mat-card-content>
            </mat-card>
          } @empty {
            <mat-card appearance="outlined">
              <mat-card-content
                >No todos found, create some...
              </mat-card-content>
            </mat-card>
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

  newTodoDescription = signal('');

  createTodo() {
    console.log('XXX called');
    const newTodoDescription = this.newTodoDescription();
    if (newTodoDescription.length > 0) {
      this.todos.create({ description: newTodoDescription, completed: false });
    }
    this.newTodoDescription.set('');
  }
}
