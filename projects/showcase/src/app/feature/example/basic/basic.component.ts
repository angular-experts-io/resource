import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { restResource } from '@angular-experts/resource';

import { Todo } from '../../../model/todo.model';
import { TodoItemComponent } from '../../../ui/todo-item/todo-item.component';
import { TodoSkeletonComponent } from '../../../ui/todo-skeleton/todo-skeleton.component';

@Component({
  selector: 'showcase-basic',
  imports: [
    MatInput,
    MatFormField,
    MatProgressSpinnerModule,
    TodoItemComponent,
    TodoSkeletonComponent,
  ],
  template: `
    <h2>Basic</h2>
    <div class="mt-8 flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3>Todo list</h3>
          @if (todos.loading()) {
            <mat-progress-spinner
              diameter="32"
              mode="indeterminate"
            ></mat-progress-spinner>
          }
        </div>

        <mat-form-field appearance="outline">
          <input
            #todoDescriptionInputRef
            matInput
            placeholder="What am I going to do..."
            [value]="newTodo()"
            (input)="newTodo.set(todoDescriptionInputRef.value)"
            (keyup.enter)="createTodo()"
            [disabled]="todos.loading()"
          />
        </mat-form-field>

        <div class="relative flex flex-col gap-4">
          @if (todos.loadingInitial()) {
            <showcase-todo-skeleton [repeat]="4" />
          } @else {
            @for (todo of todos.values(); track todo.id) {
              <showcase-todo-item
                [disabled]="todos.loading() && !todos.loadingInitial()"
                [todo]="todo"
                (toggle)="handleToggle(todo)"
                (remove)="handleRemove(todo)"
              />
            } @empty {
              @if (!todos.loadingInitial()) {
                <span>No todos found, create some...</span>
              }
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
export class BasicComponent {
  todos = restResource<Todo, string>('todos');
  newTodo = signal('');

  createTodo() {
    const newTodoValue = this.newTodo();
    if (newTodoValue.length > 0) {
      this.todos.create({ description: newTodoValue, completed: false });
    }
    this.newTodo.set('');
  }

  handleToggle(todo: Todo) {
    this.todos.update({ ...todo, completed: !todo.completed });
  }

  handleRemove(todo: Todo) {
    this.todos.remove(todo);
  }
}
