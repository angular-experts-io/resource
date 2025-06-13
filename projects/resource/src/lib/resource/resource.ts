import { HttpClient } from '@angular/common/http';
import {
  inject,
  signal,
  computed,
  ResourceRef,
  linkedSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap, catchError, map } from 'rxjs';

import {
  RestResourceOptions,
  RequestType,
  Strategy,
  LOG_PREFIX,
} from './resource.model';
import { behaviorToOperator, streamify } from './resource.util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restResource<T, ID, E extends Error = Error>(
  apiEndpoint: string,
  options: RestResourceOptions<T, ID> = {},
) {
  const http = inject(HttpClient);

  const strategy: Strategy = options.strategy ?? 'pessimistic';

  const loadingCreate = signal(false);
  const loadingUpdate = signal(false);
  const loadingRemove = signal(false);
  const errorCreate = signal<E | undefined>(undefined);
  const errorUpdate = signal<E | undefined>(undefined);
  const errorRemove = signal<E | undefined>(undefined);

  const resource = rxResource({
    params: () => options.params?.() ?? '',
    stream: ({ params }) => {
      const fullUrl = `${apiEndpoint}${params}`;
      verbose('Read (Angular resource)', { params, fullUrl });
      return http.get<T[]>(fullUrl);
    },
  });

  const values = linkedSignal({
    source: () => {
      try {
        return resource.value();
      } catch {
        return undefined;
      }
    },
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
        if (options.create?.id?.generator) {
          const newId = options.create?.id.generator();
          if (options.create?.id?.setter) {
            options.create?.id?.setter(newId, item);
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
            !options.create?.id?.generator &&
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
      behaviorToOperator(options.create?.behavior)(([item]) =>
        http.post<T | undefined | null>(apiEndpoint, item).pipe(
          tap((createdItem) => {
            if (isIncremental('create', options)) {
              if (!createdItem) {
                console.warn(
                  LOG_PREFIX,
                  `Incremental create request returned no item, this is unexpected, if your API does not return the created item, consider using "optimistic" strategy instead, Skip...`,
                );
              } else {
                resource.update((prev) => [...(prev ?? []), createdItem]);
              }
            }
          }),
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
      map(([item]) => {
        loadingUpdate.set(true);
        if (isOptimistic('update', options)) {
          const updatedItemId = getItemId(item, options);
          const prevVersionOfItem = resource
            .value()
            ?.find(
              (prevItem) => getItemId(prevItem, options) === updatedItemId,
            );
          resource.update((prev) =>
            prev?.map((prevItem) => {
              return getItemId(prevItem, options) === updatedItemId
                ? { ...prevItem, ...item }
                : prevItem;
            }),
          );
          return { item, prevVersionOfItem };
        }
        return { item };
      }),
      behaviorToOperator(options.update?.behavior)(
        ({ item, prevVersionOfItem }) => {
          const updatedItemId = getItemId(item!, options);
          return http
            .put<
              T | null | undefined
            >(`${apiEndpoint}/${updatedItemId?.toString()}`, item)
            .pipe(
              tap((updatedItem) => {
                if (isIncremental('update', options)) {
                  if (!updatedItem) {
                    console.warn(
                      LOG_PREFIX,
                      `Incremental update request returned no item, this is unexpected, if your API does not return the updated item, consider using "optimistic" strategy instead, Skip...`,
                    );
                  } else {
                    resource.update((prev) =>
                      prev?.map((prevItem) => {
                        return getItemId(prevItem, options) === updatedItemId
                          ? updatedItem
                          : prevItem;
                      }),
                    );
                  }
                }
              }),
              catchError((err) => {
                errorUpdate.set(err);
                if ((options.update?.strategy ?? strategy) === 'optimistic') {
                  resource.update((prev) =>
                    prev?.map((prevItem) => {
                      return getItemId(prevItem, options) === updatedItemId
                        ? prevVersionOfItem!
                        : prevItem;
                    }),
                  );
                }
                return [undefined];
              }),
            );
        },
      ),
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
      behaviorToOperator(options.remove?.behavior)(([item]) =>
        http
          .delete<
            T | ID | null | undefined
          >(`${apiEndpoint}/${getItemId(item, options)}`)
          .pipe(
            tap((removedItemOrId) => {
              if (isIncremental('remove', options)) {
                if (removedItemOrId === null || removedItemOrId === undefined) {
                  console.warn(
                    LOG_PREFIX,
                    `Incremental remove request returned no item or item ID, this is unexpected, if your API does not return the removed item or removed item ID, consider using "optimistic" strategy instead, Skip...`,
                  );
                } else {
                  const removedItemId =
                    typeof removedItemOrId === 'object'
                      ? getItemId(removedItemOrId as T, options)
                      : (removedItemOrId as ID);
                  resource.update((prev) =>
                    prev?.filter(
                      (prevItem) =>
                        getItemId(prevItem, options) !== removedItemId,
                    ),
                  );
                }
              }
            }),
            catchError((err) => {
              errorRemove.set(err);
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

  function getItemId(item: T, options: RestResourceOptions<T, ID>): ID {
    return options.idSelector?.(item) ?? (item as unknown as { id: ID }).id;
  }

  function isOptimistic(
    requestType: RequestType,
    options: RestResourceOptions<T, ID>,
  ) {
    return (options[requestType]?.strategy ?? strategy) === 'optimistic';
  }

  function isIncremental(
    requestType: RequestType,
    options: RestResourceOptions<T, ID>,
  ) {
    return (options[requestType]?.strategy ?? strategy) === 'incremental';
  }

  function reloadIfPessimisticOrHasParams(
    requestType: RequestType,
    resource: ResourceRef<T[] | undefined>,
    options: RestResourceOptions<T, ID>,
  ) {
    if (
      (options[requestType]?.strategy ?? options.strategy ?? 'pessimistic') ===
        'pessimistic' ||
      options.params
    ) {
      resource.reload();
    }
  }

  function verbose(...args: unknown[]) {
    if (options.verbose) {
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
    hasValue: computed(() => value() !== null && value() !== undefined),
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
