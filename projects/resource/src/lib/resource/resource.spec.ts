import { jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { delay, mergeMap, of, tap, throwError, timer } from 'rxjs';

import { restResource } from './resource';
import clock = jasmine.clock;

describe('Rest Resource', () => {
  let injector: Injector;
  let mockGet: jest.Mock;
  let mockPost: jest.Mock;
  let mockPut: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockPut = jest.fn();
    mockDelete = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: {
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
          },
        },
      ],
    });
    injector = TestBed.inject(Injector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CRUD', () => {
    describe('Read', () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;

      beforeEach(() => {
        mockGet.mockReturnValue(of(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY));
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
      });

      it('loads and exposes data in the values', async () => {
        await tick();
        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);
        expect(resource.hasValue()).toBe(false);
        expect(resource.value()).toBe(undefined);
      });

      it('loads and exposes data in the value as long as ony one item is returned', async () => {
        mockGet.mockReturnValue(of([TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]]));
        await tick();
        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.hasValue()).toBe(true);
        expect(resource.value()).toEqual(
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
        );
      });

      it('sets loadingInitial (but NOT loading) when loading entities for the first time', async () => {
        expect(resource.loadingInitial()).toBe(true);
        expect(resource.loading()).toBe(false);

        await tick();

        expect(resource.loadingInitial()).toBe(false);
        expect(resource.loading()).toBe(false);
      });

      it('sets loadingInitial (but NOT loading) when loading entities for the first time', async () => {
        expect(resource.loadingInitial()).toBe(true);
        expect(resource.loading()).toBe(false);

        await tick();

        resource.reload();

        expect(resource.loadingInitial()).toBe(false);
        expect(resource.loading()).toBe(true);

        await tick();

        expect(resource.loadingInitial()).toBe(false);
        expect(resource.loading()).toBe(false);
      });

      it('exposes error if it happens', async () => {
        mockGet.mockReturnValueOnce(throwError(() => new Error('404')));
        expect(resource.loadingInitial()).toBe(true);
        expect(resource.loading()).toBe(false);
        expect(resource.errorRead()).toBe(undefined);

        await tick();

        expect(resource.loadingInitial()).toBe(false);
        expect(resource.loading()).toBe(false);
        expect(resource.errorRead()).toEqual(new Error('404'));

        resource.reload();

        // prev initial loading failed
        expect(resource.loadingInitial()).toBe(true);
        expect(resource.loading()).toBe(false);
        // error stays (Angular resource behavior)
        expect(resource.errorRead()).toEqual(new Error('404'));

        await tick();

        expect(resource.loadingInitial()).toBe(false);
        expect(resource.loading()).toBe(false);
        expect(resource.errorRead()).toBe(undefined);
      });
    });

    describe('Read with params', () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;
      const paramsId = signal<string | undefined>(undefined);

      beforeEach(() => {
        paramsId.set(undefined);
        mockGet.mockImplementation((...args) => {
          const url = args[0] as string;
          let result;
          if (url.includes('/1')) {
            result = [TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]];
          } else if (url.includes('/2')) {
            result = [TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1]];
          } else {
            result = TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY;
          }
          return of(result).pipe(delay(10));
        });
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              params: () => (paramsId() ? `/${paramsId()}` : undefined),
            },
          );
        });
      });

      it('loads all values when no id was specified', async () => {
        await tick(); // trigger
        await tick(20); // wait for an initial load
        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);
        expect(resource.hasValue()).toBe(false);
        expect(resource.value()).toBe(undefined);
      });

      it('reloads items on params change', async () => {
        await tick(); // trigger
        await tick(20); // wait for an initial load
        expect(resource.values()?.length).toBe(2);

        paramsId.set('1');
        await tick();
        await tick(20);
        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.hasValue()).toBe(true);
        expect(resource.value()).toEqual(
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
        );
      });

      it('preserves previous value while reloading becasue params have changed', async () => {
        await tick(); // trigger
        await tick(20); // wait for an initial load
        expect(resource.values()?.length).toBe(2);

        paramsId.set('1');
        await tick();

        // preserves original valuees
        expect(resource.values()?.length).toBe(2);

        await tick(20);
        expect(resource.values()?.length).toBe(1);
      });
    });

    describe('Create', () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;
      let data: EntityWithIdInIdProperty[];

      beforeEach(() => {
        data = [...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY];
        mockGet.mockImplementation(() => of(data));
        mockPost.mockImplementation((...args) => {
          const createdItem = args[1] as EntityWithIdInIdProperty;
          data = [...data, createdItem];
          return of(undefined).pipe(delay(10));
        });
      });

      it('creates an item and reloads the collection (pessimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        await tick(20); // wait for create to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(3);
        expect(resource.values()?.[2]).toEqual({
          id: '3',
          name: 'Test Entity 3',
        });
      });

      it('creates an item and does not reload collection (optimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { create: { strategy: 'optimistic' } },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(3);
        expect(resource.values()?.[2]).toEqual({
          id: '3',
          name: 'Test Entity 3',
        });
      });

      it('creates an item and adds it to collection (incremental)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { create: { strategy: 'incremental' } },
          );
        });
        mockPost.mockImplementation((...args) => {
          const createdItem = args[1] as EntityWithIdInIdProperty;
          return of(createdItem).pipe(delay(10));
        });

        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(3);
        expect(resource.values()?.[2]).toEqual({
          id: '3',
          name: 'Test Entity 3',
        });
      });

      it('skips optimistic update if no id (or id creator) was provided', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { create: { strategy: 'optimistic' } },
          );
        });
        await tick();

        const consoleWarnSpy = jest
          .spyOn(console, 'warn')
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .mockImplementation(() => {});

        resource.create({
          name: 'Test Entity 3',
        });

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[@angular-experts/resource]',
          `Optimistic update can only be performed if the provided item has an ID. ID can be added manually or using "options.create.id.generator", Skip...`,
        );
      });

      it('skips incremental update if no item was returned', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { create: { strategy: 'incremental' } },
          );
        });
        const consoleWarnSpy = jest
          .spyOn(console, 'warn')
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .mockImplementation(() => {});
        mockPost.mockImplementation(() => {
          return of(undefined).pipe(delay(10));
        });

        await tick();

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[@angular-experts/resource]',
          `Incremental create request returned no item, this is unexpected, if your API does not return the created item, consider using "optimistic" strategy instead, Skip...`,
        );
      });

      it('sets crate loading and loading state while creating', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.loading()).toBe(false);
        expect(resource.loadingCreate()).toBe(false);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        expect(resource.loading()).toBe(true);
        expect(resource.loadingCreate()).toBe(true);

        await tick(20);

        expect(resource.loading()).toBe(false);
        expect(resource.loadingCreate()).toBe(false);
      });

      it('handles error and reloads (pessimistic)', async () => {
        mockPost.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);
        expect(resource.errorCreate()).toEqual(new Error('404'));
        expect(resource.values()?.length).toBe(2);
      });

      it('handles error and reverts created value (optimistic)', async () => {
        mockPost.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              create: { strategy: 'optimistic' },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          id: '3',
          name: 'Test Entity 3',
        });

        expect(resource.values()?.length).toBe(3);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(resource.errorCreate()).toEqual(new Error('404'));

        expect(resource.values()?.length).toBe(2);
      });

      it('creates an item and uses id generator (generator)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              strategy: 'optimistic',
              create: {
                id: {
                  generator: () => '3',
                },
              },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(3);
        expect(resource.values()?.[2]).toEqual({
          id: '3',
          name: 'Test Entity 3',
        });
      });

      it('creates an item and uses id generator (generator + setter)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              strategy: 'optimistic',
              create: {
                id: {
                  generator: () => '3',
                  setter: (id, item) => {
                    item.id = id;
                  },
                },
              },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.create({
          name: 'Test Entity 3',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(3);
        expect(resource.values()?.[2]).toEqual({
          id: '3',
          name: 'Test Entity 3',
        });
      });
    });

    describe('Update', () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;
      let data: EntityWithIdInIdProperty[];

      beforeEach(() => {
        data = [...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY];
        mockGet.mockImplementation(() => of(data));
        mockPut.mockImplementation((...args) => {
          const url = args[0] as string;
          const updatedItem = args[1] as EntityWithIdInIdProperty;
          data = data.map((item) => {
            if (url.includes(`/${item.id}`)) {
              return updatedItem;
            } else {
              return item;
            }
          });
          return of(undefined).pipe(delay(10));
        });
      });

      it('updates first item and reloads the collection (pessimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
          name: 'updated',
        });

        await tick(20); // wait for update to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);
        expect(resource.values()?.[0]).toEqual({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
          name: 'updated',
        });
      });

      it('updates second item and does not reload collection (optimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { update: { strategy: 'optimistic' } },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);
        expect(resource.values()?.[1]).toEqual({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });
      });

      it('updates second item and replaces is in the collection (incremental)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { update: { strategy: 'incremental' } },
          );
        });
        mockPut.mockImplementation((...args) => {
          const updatedItem = args[1] as EntityWithIdInIdProperty;
          return of(updatedItem).pipe(delay(10));
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);
        expect(resource.values()?.[1]).toEqual({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });
      });

      it('skips incremental update if no item was returned', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { update: { strategy: 'incremental' } },
          );
        });
        const consoleWarnSpy = jest
          .spyOn(console, 'warn')
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .mockImplementation(() => {});
        mockPut.mockImplementation(() => {
          return of(undefined).pipe(delay(10));
        });

        await tick();

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[@angular-experts/resource]',
          `Incremental update request returned no item, this is unexpected, if your API does not return the updated item, consider using "optimistic" strategy instead, Skip...`,
        );
      });

      it('sets update loading and loading state while updating', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.loading()).toBe(false);
        expect(resource.loadingUpdate()).toBe(false);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
          name: 'updated',
        });

        expect(resource.loading()).toBe(true);
        expect(resource.loadingUpdate()).toBe(true);

        await tick(20);

        expect(resource.loading()).toBe(false);
        expect(resource.loadingUpdate()).toBe(false);
      });

      it('handles error and reloads (pessimistic)', async () => {
        mockPut.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
          name: 'updated',
        });

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);
        expect(resource.errorUpdate()).toEqual(new Error('404'));
        expect(resource.values()?.[0]).toEqual(
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
        );
      });

      it('handles error and reverts updated value (optimistic)', async () => {
        mockPut.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              update: { strategy: 'optimistic' },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.update({
          ...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
          name: 'updated',
        });

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(resource.errorUpdate()).toEqual(new Error('404'));

        expect(resource.values()?.length).toBe(2);
        expect(resource.values()?.[0]).toEqual(
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
        );
      });
    });

    describe('Remove', () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;
      let data: EntityWithIdInIdProperty[];

      beforeEach(() => {
        data = [...TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY];
        mockGet.mockImplementation(() => of(data));
        mockDelete.mockImplementation((...args) => {
          const url = args[0] as string;
          return of(undefined).pipe(
            delay(10),
            tap(() => {
              if (url.includes('/1')) {
                data = data.filter((item) => item.id !== '1');
              } else if (url.includes('/2')) {
                data = data.filter((item) => item.id !== '2');
              }
            }),
          );
        });
      });

      it('removes first item and reloads collection (pessimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.values()).toEqual([
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
        ]);
      });

      it('removes first item and does not reload collection (optimistic)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { remove: { strategy: 'optimistic' } },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.values()).toEqual([
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
        ]);
      });

      it('removes an item and removes it from collection (incremental)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { remove: { strategy: 'incremental' } },
          );
        });
        mockDelete.mockImplementation((...args) => {
          const removedItemId = (args[0] as string).split('/').reverse()[0];
          return of(removedItemId).pipe(delay(10));
        });

        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove({
          id: '2',
          name: 'Test Entity 2',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
      });

      it('skips incremental update if no item was returned', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { remove: { strategy: 'incremental' } },
          );
        });
        const consoleWarnSpy = jest
          .spyOn(console, 'warn')
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .mockImplementation(() => {});
        mockPost.mockImplementation(() => {
          return of(undefined).pipe(delay(10));
        });

        await tick();

        resource.remove({
          id: '2',
          name: 'Test Entity 2',
        });

        await tick(20); // wait for delete to finish
        await tick(); // refresh doesn't happen but still wait to catch potential errors

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[@angular-experts/resource]',
          `Incremental remove request returned no item or item ID, this is unexpected, if your API does not return the removed item or removed item ID, consider using "optimistic" strategy instead, Skip...`,
        );
      });

      it('sets remove loading and loading state while removing', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            { remove: { strategy: 'optimistic' } },
          );
        });
        await tick();

        expect(resource.loading()).toBe(false);
        expect(resource.loadingRemove()).toBe(false);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);

        expect(resource.loading()).toBe(true);
        expect(resource.loadingRemove()).toBe(true);

        await tick(20);

        expect(resource.loading()).toBe(false);
        expect(resource.loadingRemove()).toBe(false);
      });

      it('handles error and reloads (pessimistic)', async () => {
        mockDelete.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);
        expect(resource.errorRemove()).toEqual(new Error('404'));
      });

      it('handles error and reverts removed value (optimistic)', async () => {
        mockDelete.mockImplementation(() =>
          timer(10).pipe(mergeMap(() => throwError(() => new Error('404')))),
        );
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              remove: { strategy: 'optimistic' },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(resource.errorRemove()).toEqual(new Error('404'));

        expect(resource.values()?.length).toBe(2);
      });

      it('removes multiple items (concat - default)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>('some/api');
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);
        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1]);

        await tick(12); // wait for 1st delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);

        await tick(20); // wait for 2nd delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(3);

        expect(resource.hasValues()).toBe(false);
        expect(resource.values()?.length).toBe(0);
      });

      it('removes multiple items (merge)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              remove: {
                behavior: 'merge',
              },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);
        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockDelete).toHaveBeenCalledTimes(2);
        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(false);
        expect(resource.values()?.length).toBe(0);
      });

      it('removes multiple items (switch)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              remove: {
                behavior: 'switch',
              },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);
        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockDelete).toHaveBeenCalledTimes(2);
        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.values()).toEqual([
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0],
        ]);
      });

      it('removes multiple items (exhaust)', async () => {
        runInInjectionContext(injector, () => {
          resource = restResource<EntityWithIdInIdProperty, string>(
            'some/api',
            {
              remove: {
                behavior: 'exhaust',
              },
            },
          );
        });
        await tick();

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(2);

        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]);
        resource.remove(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1]);

        await tick(20); // wait for delete to finish
        await tick(); // wait for refresh to finish

        expect(mockGet).toHaveBeenCalledTimes(2);

        expect(resource.hasValues()).toBe(true);
        expect(resource.values()?.length).toBe(1);
        expect(resource.values()).toEqual([
          TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[1],
        ]);
      });
    });
  });

  describe('Other options', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(of(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY));
    });

    it('verbose', async () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInIdProperty, string>
      >;
      runInInjectionContext(injector, () => {
        resource = restResource<EntityWithIdInIdProperty, string>('some/api', {
          verbose: true,
        });
      });

      const consoleDebugSpy = jest
        .spyOn(console, 'debug')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      await tick();

      expect(resource.hasValues()).toBe(true);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[@angular-experts/resource]',
        'Read (Angular resource)',
        { fullUrl: 'some/api', params: '' },
      );
    });

    it('idSelector', async () => {
      let resource: ReturnType<
        typeof restResource<EntityWithIdInOtherIdProperty, string>
      >;
      runInInjectionContext(injector, () => {
        resource = restResource<EntityWithIdInOtherIdProperty, string>(
          'some/api',
          {
            idSelector: (item) => item.otherId,
          },
        );
      });

      await tick();

      resource.remove(TEST_ENTITIES_WITH_ID_IN_OTHER_ID_PROPERTY[0]);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith('some/api/1');
    });
  });
});

async function tick(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

interface EntityWithIdInIdProperty {
  id: string;
  name: string;
}

interface EntityWithIdInOtherIdProperty {
  otherId: string;
  name: string;
}

const TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY: EntityWithIdInIdProperty[] = [
  {
    id: '1',
    name: 'Test Entity 1',
  },
  {
    id: '2',
    name: 'Test Entity 2',
  },
];

const TEST_ENTITIES_WITH_ID_IN_OTHER_ID_PROPERTY: EntityWithIdInOtherIdProperty[] =
  [
    {
      otherId: '1',
      name: 'Test Entity 1',
    },
    {
      otherId: '2',
      name: 'Test Entity 2',
    },
  ];
