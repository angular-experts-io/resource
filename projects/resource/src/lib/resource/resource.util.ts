import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  concatMap,
  exhaustMap,
  mergeMap,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';

import { Behavior } from './resource.model';

export function streamify<T extends unknown[]>(
  impl: (stream: Observable<T>) => Observable<unknown>,
) {
  const destroyRef = inject(DestroyRef);
  const subject = new Subject<T>();
  impl(subject).pipe(takeUntilDestroyed(destroyRef)).subscribe();
  return (...args: T) => {
    subject.next(args);
  };
}

export function behaviorToOperator(behavior: Behavior = 'concat') {
  switch (behavior) {
    case 'concat':
      return concatMap;
    case 'merge':
      return mergeMap;
    case 'switch':
      return switchMap;
    case 'exhaust':
      return exhaustMap;
  }
}
