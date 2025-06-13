import { inject, isDevMode } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { delay } from 'rxjs';

import { TodoBackendMockService } from '../mock/todo-backend-mock.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const todoBackendMock = inject(TodoBackendMockService);
  if (req.url.includes('assets')) {
    return next(req);
  } else {
    req = req.clone({
      url: `https://681db05cf74de1d219b09e9c.mockapi.io/api/v1/` + req.url,
    });
    if (false) {
      // hit real server in dev mode
      return next(req);
    } else {
      // hit mock todo server in prod mode so every visitor gets their own todo data
      return todoBackendMock.handleRequest(req).pipe(delay(250));
    }
  }
};
