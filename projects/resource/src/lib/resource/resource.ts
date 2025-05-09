import { HttpClient } from '@angular/common/http';
import {
  inject,
  DestroyRef,
  signal,
  computed,
  ResourceRef,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, rxResource } from '@angular/core/rxjs-interop';
import {
  Subject,
  concatMap,
  tap,
  Observable,
  mergeMap,
  switchMap,
  exhaustMap,
  catchError,
  map,
} from 'rxjs';

export function restResource<T, ID>(
  apiEndpoint: string,
  options?: CrudResourceOptions<T, ID>,
) {
  const http = inject(HttpClient);

  const strategy = options?.strategy ?? 'pessimistic';

  const loadingCreate = signal(false);
  const loadingUpdate = signal(false);
  const loadingRemove = signal(false);
  const errorCreate = signal('');
  const errorUpdate = signal('');
  const errorRemove = signal('');

  const resource = rxResource({
    request: () => options?.params?.() ?? '',
    loader: ({ request }) => {
      return http.get<T[]>(`${apiEndpoint}${request}`);
    },
  });

  const items = linkedSignal({
    source: resource.value,
    computation: (source, previous) => {
      if (!source && previous?.value) {
        return previous.value;
      } else {
        return source;
      }
    },
  });

  const create = streamify<[item: T]>((stream) =>
    stream.pipe(
      tap(([item]) => {
        loadingCreate.set(true);
        if (isOptimistic('create', options)) {
          resource.update((prev) => [...(prev ?? []), item]);
        }
      }),
      behaviorToOperator(options?.create?.behavior)(([item]) =>
        http.post(apiEndpoint, item).pipe(
          catchError((err) => {
            errorCreate.set(err);
            if (isOptimistic('create', options)) {
              resource.update((prev) =>
                prev?.filter((prevItem) => prevItem !== item),
              );
            }
            return [undefined];
          }),
        ),
      ),
      tap(() => {
        reloadIfPessimisticOrHasParams('create', resource, options);
        loadingCreate.set(false);
      }),
    ),
  );

  const update = streamify<[id: ID, item: T]>((stream) =>
    stream.pipe(
      tap(([id, item]) => {
        loadingUpdate.set(true);
        if (isOptimistic('update', options)) {
          resource.update((prev) =>
            prev?.map((prevItem) => {
              return getItemId(prevItem, options) === id
                ? { ...prevItem, ...item }
                : prevItem;
            }),
          );
        }
      }),
      behaviorToOperator(options?.update?.behavior)(([id, item]) =>
        http.put(`${apiEndpoint}/${id}`, item).pipe(
          catchError((err) => {
            errorUpdate.set(err);
            if ((options?.update?.strategy ?? strategy) === 'optimistic') {
              resource.update((prev) =>
                prev?.map((prevItem) => {
                  return getItemId(prevItem, options) === id ? item : prevItem;
                }),
              );
            }
            return [undefined];
          }),
        ),
      ),
      tap(() => {
        reloadIfPessimisticOrHasParams('update', resource, options);
        loadingUpdate.set(false);
      }),
    ),
  );

  const remove = streamify<[id: ID]>((stream) =>
    stream.pipe(
      tap(() => loadingRemove.set(true)),
      map(([id]) => {
        const removedItem = resource
          .value()
          ?.find((item) => getItemId(item, options) === id);
        if (isOptimistic('remove', options) && removedItem) {
          resource.update((prev) =>
            prev?.filter((prevItem) => prevItem !== removedItem),
          );
        }
        return { id, removedItem };
      }),
      behaviorToOperator(options?.remove?.behavior)(({ id, removedItem }) =>
        http.delete(`${apiEndpoint}/${id}`).pipe(
          catchError((err) => {
            errorUpdate.set(err);
            if (isOptimistic('remove', options) && removedItem) {
              resource.update((prev) => [...(prev ?? []), removedItem]);
            }
            return [undefined];
          }),
        ),
      ),
      tap(() => {
        reloadIfPessimisticOrHasParams('remove', resource, options);
        loadingRemove.set(false);
      }),
    ),
  );

  function getItemId(item: T, options?: CrudResourceOptions<T, ID>): ID {
    return options?.idSelector?.(item) ?? (item as unknown as { id: ID }).id;
  }

  function isOptimistic(
    requestType: RequestType,
    options?: CrudResourceOptions<T, ID>,
  ) {
    return (options?.[requestType]?.strategy ?? strategy) === 'optimistic';
  }

  function reloadIfPessimisticOrHasParams(
    requestType: RequestType,
    resource: ResourceRef<T[] | undefined>,
    options?: CrudResourceOptions<T, ID>,
  ) {
    if (
      (options?.[requestType]?.strategy ??
        options?.strategy ??
        'pessimistic') === 'pessimistic' ||
      options?.params
    ) {
      resource.reload();
    }
  }

  const loading = computed(
    () =>
      !loadingInitial() &&
      (resource.isLoading() ||
        loadingCreate() ||
        loadingUpdate() ||
        loadingRemove()),
  );
  const loadingInitial = computed(() => !items() && resource.isLoading());

  return {
    loadingInitial,
    loading,
    loadingCreate,
    loadingUpdate,
    loadingRemove,
    errorCreate,
    errorUpdate,
    errorRemove,
    value: items,
    create,
    update,
    remove,
  };
}

function streamify<T extends unknown[]>(
  impl: (stream: Observable<T>) => Observable<unknown>,
) {
  const destroyRef = inject(DestroyRef);
  const subject = new Subject<T>();
  impl(subject).pipe(takeUntilDestroyed(destroyRef)).subscribe();
  return (...args: T) => {
    subject.next(args);
  };
}

function behaviorToOperator(behavior: Behavior = 'concat') {
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

export type RequestType = 'create' | 'update' | 'remove';
export type Behavior = 'concat' | 'merge' | 'switch' | 'exhaust';
export type Strategy = 'optimistic' | 'pessimistic';

export interface CrudResourceOptions<T, ID> {
  params?: () => string | undefined;

  // TODO id frontend / backend
  // single item mode? eg computed item if array is length of 1 else undefined ?
  // CQRS vs single item return mode ?
  // return back observable to notify completion (for orchestration)

  idSelector?: (item: T) => ID;
  /**
   * The default strategy for the resource for every request type,
   * it can be overridden by the request type specific strategy
   *
   * @default 'pessimistic'
   */
  strategy?: Strategy;
  create?: {
    behavior: Behavior;
    strategy?: Strategy;
  };
  update?: {
    behavior: Behavior;
    strategy?: Strategy;
  };
  remove?: {
    behavior: Behavior;
    strategy?: Strategy;
  };
}
