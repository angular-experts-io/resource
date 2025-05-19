import { jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { restResource } from './resource';
import { Injector, runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';

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

  describe('Entity with ID stored in the "id" property', () => {
    let resource: ReturnType<
      typeof restResource<EntityWithIdInIdProperty, 'string'>
    >;

    beforeEach(() => {
      mockGet.mockReturnValue(of(TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY));
      runInInjectionContext(injector, () => {
        resource = restResource<EntityWithIdInIdProperty, 'string'>('some/api');
      });
    });

    describe('CRUD', () => {
      describe('Read', () => {
        it('loads and exposes data in the values', async () => {
          await tick();
          expect(resource.hasValues()).toBe(true);
          expect(resource.values()?.length).toBe(2);
          expect(resource.hasValue()).toBe(false);
          expect(resource.value()).toBe(undefined);
        });

        it('loads and exposes data in the value as long as ony one item is returned', async () => {
          mockGet.mockReturnValue(
            of([TEST_ENTITIES_WITH_ID_IN_ID_PROPERTY[0]]),
          );
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
    });
  });
});

interface EntityWithIdInIdProperty {
  id: string;
  name: string;
}

async function tick() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
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
