import { ChangeDetectionStrategy, Component, signal } from '@angular/core'; // Removed inject
import { CommonModule } from '@angular/common';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { restResource } from '@angular-experts/resource'; // Added back
import { Todo } from '../../../model/todo.model';
import { TodoItemComponent } from '../../../ui/todo-item/todo-item.component';
import { TodoSkeletonComponent } from '../../../ui/todo-skeleton/todo-skeleton.component';

@Component({
  selector: 'showcase-basic',
  imports: [
    CommonModule,
    MatInput,
    MatFormField,
    TodoItemComponent,
    TodoSkeletonComponent,
    MatProgressSpinnerModule,
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
            [disabled]="todos.loading()"
          />
        </mat-form-field>

        <div class="relative flex flex-col gap-4">
          <!-- Spinner for non-initial loads -->
          @if (todos.loading() && !todos.loadingInitial()) {
            <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <mat-progress-spinner diameter="24" mode="indeterminate"></mat-progress-spinner>
            </div>
          }

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
  todos = restResource<Todo, string>('todos', { // Added back local restResource
    create: {
      strategy: 'incremental'
    }
  });
  newTodo = signal('');

  createTodo() {
    const newTodoValue = this.newTodo();
    if (newTodoValue.length > 0) {
      this.todos.create({ description: newTodoValue, completed: false }); // Changed to todos.create
    }
    this.newTodo.set('');
  }

  handleToggle(todo: Todo) {
    this.todos.update({ ...todo, completed: !todo.completed }); // Changed to todos.update
  }

  handleRemove(todo: Todo) {
    this.todos.remove(todo); // Changed to todos.remove
  }
}
