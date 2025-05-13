import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatFormField, MatInput } from '@angular/material/input';

import { restResource } from '@angular-experts/resource';

import { Todo } from '../../../model/todo.model';
import { TodoItemComponent } from '../../../ui/todo-item/todo-item.component';
import { TodoSkeletonComponent } from '../../../ui/todo-skeleton/todo-skeleton.component';

@Component({
  selector: 'showcase-basic',
  imports: [MatInput, MatFormField, TodoItemComponent, TodoSkeletonComponent],
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
            <showcase-todo-skeleton [repeat]="4" />
          } @else {
            @for (todo of todos.values(); track todo.id) {
              <showcase-todo-item
                [disabled]="todos.loading()"
                [todo]="todo"
                (toggle)="handleToggle(todo)"
                (remove)="handleRemove(todo)"
              />
            } @empty {
              <span>No todos found, create some...</span>
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
    const newTodo = this.newTodo();
    if (newTodo.length > 0) {
      this.todos.create({ description: newTodo, completed: false });
    }
    this.newTodo.set('');
  }

  handleToggle(todo: Todo) {
    this.todos.update(todo.id!, { ...todo, completed: !todo.completed });
  }

  handleRemove(todo: Todo) {
    this.todos.remove(todo);
  }
}
