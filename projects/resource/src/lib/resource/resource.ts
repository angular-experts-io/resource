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

const LOG_PREFIX = `[@angular-experts/resource]`;

export function restResource<T, ID>(
  apiEndpoint: string,
  options?: RestResourceOptions<T, ID>,
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
      const fullUrl = `${apiEndpoint}${request}`;
      verbose('Read (Angular resource)', { request, fullUrl });
      return http.get<T[]>(fullUrl);
    },
  });

  const values = linkedSignal({
    source: resource.value,
    computation: (
      source: T[] | undefined,
      previous: { source: T[] | undefined; value: T[] | undefined } | undefined,
    ) => {
      if (!source && previous?.value) {
        return previous.value;
      } else {
        return source;
      }
    },
  });

  const value = computed(() => {
    const unwrappedItems = values();
    if (unwrappedItems?.length === 1) {
      return unwrappedItems[0];
    } else {
      return undefined;
    }
  });

  const create = streamify<[item: Partial<T>]>((stream) =>
    stream.pipe(
      map(([item]) => {
        if (options?.create?.id?.generator) {
          const newId = options?.create?.id.generator();
          if (options?.create?.id?.setter) {
            options?.create?.id?.setter(newId, item);
          } else {
            (item as unknown as { id: ID }).id = newId;
          }
        }
        return [item];
      }),
      tap(([item]) => {
        loadingCreate.set(true);
        if (isOptimistic('create', options)) {
          if (
            !options?.create?.id?.generator &&
            !getItemId(item as T, options)
          ) {
            console.warn(
              LOG_PREFIX,
              `Optimistic update can only be performed if the provided item has an ID. ID can be added manually or using "options.create.id.generator", Skip...`,
            );
            return;
          }
          resource.update((prev) => [...(prev ?? []), item as T]);
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

  const update = streamify<[item: T]>((stream) =>
    stream.pipe(
      tap(([item]) => {
        loadingUpdate.set(true);
        if (isOptimistic('update', options)) {
          const updatedItemId = getItemId(item, options);
          resource.update((prev) =>
            prev?.map((prevItem) => {
              return getItemId(prevItem, options) === updatedItemId
                ? { ...prevItem, ...item }
                : prevItem;
            }),
          );
        }
      }),
      behaviorToOperator(options?.update?.behavior)(([item]) => {
        const updatedItemId = getItemId(item, options);
        return http
          .put(`${apiEndpoint}/${updatedItemId?.toString()}`, item)
          .pipe(
            catchError((err) => {
              errorUpdate.set(err);
              if ((options?.update?.strategy ?? strategy) === 'optimistic') {
                resource.update((prev) =>
                  prev?.map((prevItem) => {
                    return getItemId(prevItem, options) === updatedItemId
                      ? item
                      : prevItem;
                  }),
                );
              }
              return [undefined];
            }),
          );
      }),
      tap(() => {
        reloadIfPessimisticOrHasParams('update', resource, options);
        loadingUpdate.set(false);
      }),
    ),
  );

  const remove = streamify<[item: T]>((stream) =>
    stream.pipe(
      tap(() => loadingRemove.set(true)),
      tap(([item]) => {
        if (isOptimistic('remove', options)) {
          resource.update((prev) =>
            prev?.filter((prevItem) => prevItem !== item),
          );
        }
      }),
      behaviorToOperator(options?.remove?.behavior)(([item]) =>
        http.delete(`${apiEndpoint}/${getItemId(item)}`).pipe(
          catchError((err) => {
            errorUpdate.set(err);
            if (isOptimistic('remove', options)) {
              resource.update((prev) => [...(prev ?? []), item]);
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

  function getItemId(item: T, options?: RestResourceOptions<T, ID>): ID {
    return options?.idSelector?.(item) ?? (item as unknown as { id: ID }).id;
  }

  function isOptimistic(
    requestType: RequestType,
    options?: RestResourceOptions<T, ID>,
  ) {
    return (options?.[requestType]?.strategy ?? strategy) === 'optimistic';
  }

  function reloadIfPessimisticOrHasParams(
    requestType: RequestType,
    resource: ResourceRef<T[] | undefined>,
    options?: RestResourceOptions<T, ID>,
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

  function verbose(...args: unknown[]) {
    if (options?.verbose) {
      console.debug(LOG_PREFIX, ...args);
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
  const loadingInitial = computed(() => !values() && resource.isLoading());

  return {
    // LOADING
    loadingInitial,
    loading,
    loadingCreate,
    loadingUpdate,
    loadingRemove,

    // ERRORS
    errorRead: resource.error,
    errorCreate,
    errorUpdate,
    errorRemove,

    // VALUES
    /**
     * The value of the resource, ONLY if the resource is a single item.
     *
     * This is useful when building a resource to manage a single entity, eg detail view.
     *
     * @returns Signal of single item or undefined (also returns undefined if resource has more than one item)
     */
    value,
    /**
     * The values of the resource (eg list of 0 to n items).
     *
     * @returns Signal of a list of items or undefined (also returns undefined if resource has no items)
     */
    values,
    hasValue: computed(() => !!value()),
    hasValues: computed(() => !!values()?.length),

    // METHODS
    reload: resource.reload.bind(resource),
    create,
    update,
    remove,

    // LIFECYCLE
    destroy: resource.destroy.bind(resource),
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

export interface RestResourceOptions<T, ID> {
  /**
   * Whether to log verbose information to the console.
   * This is useful for debugging and understanding the resource's behavior.
   *
   * @default false
   */
  verbose?: boolean;
  /**
   * A reactive function which determines the request to be made.
   * Whenever the params change, the loader will be triggered to fetch a new value for the resource.
   *
   * (works the same way as Angular's `resource`)
   *
   * @returns A string containing URL query parameters or undefined
   */
  params?: () => string | undefined;

  /**
   * Function to extract the ID from an item when the ID is not stored in the `id` field.
   * Used to identify items for update and remove operations.
   *
   * @param item The item from which to extract the ID
   * @returns The ID of the item
   */
  idSelector?: (item: T) => ID;

  /**
   * The default strategy for the resource for every request type,
   * it can be overridden by the request type specific strategy
   *
   * @default 'pessimistic'
   */
  strategy?: Strategy;
  create?: {
    /**
     * Defines how create requests are handled when multiple requests are made.
     * Controls the RxJS flattening operator used for the HTTP request.
     *
     * @default 'concat'
     */
    behavior?: Behavior;
    /**
     * Determines whether changes are applied optimistically (before server confirmation)
     * or pessimistically (after server confirmation) for create operations.
     *
     * @default The value of the global strategy option
     */
    strategy?: Strategy;
    /**
     * Optionally generate a new item ID (if the target API does not handle this)
     * and set it on the item.
     *
     * @property generator A function that returns a new ID (e.g., UUID or auto-increment).
     *                     Used when the backend does not assign one automatically.
     *
     * @property setter (Optional) A function that sets the generated ID onto the item,
     *                  especially useful when the item’s ID field is not named `id`.
     *
     * @example
     * {
     *   id: {
     *     generator: () => uuid(),
     *     setter: (id, item) => {
     *       item.nonstandardId = id
     *     }
     *   }
     * }
     *
     */
    id?: {
      /**
       * A function that generates a new unique ID.
       * @example
       * () => uuid()
       */
      generator: () => ID;
      /**
       * (Optional) Custom logic for assigning the generated ID to the item.
       *
       * @param id The generated ID
       * @param item The item object to modify
       *
       * @example
       * setter: (id, item) => {
       *   item.nonstandardId = id
       * }
       */
      setter?: (id: ID, item: Partial<T>) => void;
    };
  };
  update?: {
    /**
     * Defines how update requests are handled when multiple requests are made.
     * Controls the RxJS flattening operator used for the HTTP request.
     *
     * @default 'concat'
     */
    behavior?: Behavior;
    /**
     * Determines whether changes are applied optimistically (before server confirmation)
     * or pessimistically (after server confirmation) for update operations.
     *
     * @default The value of the global strategy option
     */
    strategy?: Strategy;
  };
  remove?: {
    /**
     * Defines how remove requests are handled when multiple requests are made.
     * Controls the RxJS flattening operator used for the HTTP request.
     *
     * @default 'concat'
     */
    behavior?: Behavior;
    /**
     * Determines whether changes are applied optimistically (before server confirmation)
     * or pessimistically (after server confirmation) for remove operations.
     *
     * @default The value of the global strategy option
     */
    strategy?: Strategy;
  };
}

// TODO
// id selector for update
// single item mode? eg computed item if array is length of 1 else undefined ?
// CQRS vs single item return mode ?
// return back observable to notify completion (for orchestration)
