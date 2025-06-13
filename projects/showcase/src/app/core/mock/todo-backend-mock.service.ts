import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { Todo } from '../../model/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoBackendMockService {
  todos: Todo[] = [
    {
      id: '7073bc48-5372-40f0-8d76-99c54c5cd7bd',
      description: 'Learn Angular',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'b1c2d3e4-f5a6-7b8c-9d0e-f1a2b3c4d5e6',
      description: 'Understand Angular Signals',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'f7e8d9c0-b1a2-3c4d-5e6f-7g8h9i0j1k2l',
      description: 'Lern about Angular resource',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '12345678-90ab-cdef-ghij-klmnopqrstuv',
      description: 'Use restResource',
      completed: false,
      createdAt: new Date().toISOString(),
    }
  ];

  // a method which handles http requests and performs crud on the resource based on which HTTP method is used and payload
  handleRequest(request: HttpRequest<unknown>): Observable<HttpResponse<any>> {
    const { method, url, body } = request;
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];

    // Helper to ensure immutability
    const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

    // GET /todos
    if (method === 'GET' && url.endsWith('/todos')) {
      return of(new HttpResponse({ status: 200, body: clone(this.todos) }));
    }

    // GET /todos/:id
    if (method === 'GET' && url.includes('/todos/')) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        return of(new HttpResponse({ status: 200, body: clone(todo) }));
      }
      return of(new HttpResponse({ status: 404, body: { message: 'Todo not found' } }));
    }

    // POST /todos
    if (method === 'POST' && url.endsWith('/todos')) {
      const newTodo = body as Partial<Todo>;
      if (!newTodo.description) {
        return of(new HttpResponse({ status: 400, body: { message: 'Description is required' } }));
      }
      const todo: Todo = {
        id: crypto.randomUUID(),
        description: newTodo.description,
        completed: newTodo.completed || false,
        createdAt: new Date().toISOString(),
      };
      this.todos = [...this.todos, todo];
      return of(new HttpResponse({ status: 201, body: clone(todo) }));
    }

    // PUT /todos/:id
    if (method === 'PUT' && url.includes('/todos/')) {
      const index = this.todos.findIndex(t => t.id === id);
      if (index > -1) {
        const updatedTodo = { ...this.todos[index], ...(body as Partial<Todo>) };
        this.todos = [
          ...this.todos.slice(0, index),
          updatedTodo,
          ...this.todos.slice(index + 1),
        ];
        return of(new HttpResponse({ status: 200, body: clone(updatedTodo) }));
      }
      return of(new HttpResponse({ status: 404, body: { message: 'Todo not found' } }));
    }

    // DELETE /todos/:id
    if (method === 'DELETE' && url.includes('/todos/')) {
      const index = this.todos.findIndex(t => t.id === id);
      if (index > -1) {
        this.todos = [
          ...this.todos.slice(0, index),
          ...this.todos.slice(index + 1),
        ];
        return of(new HttpResponse({ status: 204 })); // No Content
      }
      return of(new HttpResponse({ status: 404, body: { message: 'Todo not found' } }));
    }

    // Fallback for unhandled routes/methods
    return of(new HttpResponse({ status: 404, body: { message: 'Not Found' } }));
  }
}
