import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('assets')) {
    return next(req);
  } else {
    req = req.clone({
      url: `https://681db05cf74de1d219b09e9c.mockapi.io/api/v1/` + req.url,
    });
    return next(req);
  }
};
