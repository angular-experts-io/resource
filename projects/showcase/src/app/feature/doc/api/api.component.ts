import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'showcase-api',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, MatExpansionModule, MatListModule],
  template: `
    <h2>API Documentation</h2>

    <div class=" mt-8 flex flex-col gap-8">
      <div>
        <h3>Main Function</h3>
        @let mainFunction = apiDoc().mainFunction;

        <div class="mt-4 flex flex-col gap-4">
          <div class="card flex-col">
            <h4>{{ mainFunction.name }}</h4>
            <p>{{ mainFunction.description }}</p>

            <div class="mt-4">
              <h5>Parameters</h5>
              <div class="flex flex-col gap-4">
                @for (param of mainFunction.parameters; track param.name) {
                  <div
                    class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900"
                  >
                    <div
                      class="grid grid-cols-1 gap-2 rounded-lg md:grid-cols-4 md:gap-6"
                    >
                      <div class="flex flex-col items-start gap-2">
                        <code>{{ param.name }}: {{ param.type }}</code>
                        @if (param.isOptional) {
                          <span class="text-xs text-gray-500">Optional</span>
                        }
                      </div>
                      <div class="flex-col gap-4 md:col-span-3">
                        <p class="text-sm">
                          {{ param.description }}
                          @if (param.defaultValue) {
                            <div class="pt-4">
                              Default value
                              <code>{{ param.defaultValue }}</code>
                            </div>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="mt-4">
              <h5>Returns</h5>
              <div class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900">
                <div
                  class="grid grid-cols-1 gap-2 rounded-lg md:grid-cols-4 md:gap-6"
                >
                  <div class="flex flex-col items-start gap-2">
                    <code>{{ mainFunction.returnType }}</code>
                  </div>
                  <div class="flex-col gap-4 md:col-span-3">
                    <p class="text-sm">{{ mainFunction.returnDescription }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3>Returned Properties</h3>
        @let returnedProperties = apiDoc().returnedProperties;

        <div class="mt-4 flex flex-col gap-4">
          <div class="card flex-col">
            <div class="flex flex-col gap-8">
              @for (property of returnedProperties; track property.name) {
                <div class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900">
                  <div
                    class="grid grid-cols-1 gap-2 rounded-lg md:grid-cols-2 md:items-center md:gap-6"
                  >
                    <div class="flex flex-col items-start gap-2">
                      <code>{{ property.name }}: {{ property.type }}</code>
                    </div>
                    <div class="flex-col gap-4">
                      <p class="text-sm">
                        {{ property.description }}
                        @if (property.defaultValue) {
                          <div class="pt-4">
                            Default value
                            <code>{{ property.defaultValue }}</code>
                          </div>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3>Returned Methods</h3>
        @let returnedMethods = apiDoc().returnedMethods;

        <div class="mt-4 flex flex-col gap-4">
          <div class="card flex-col">
            <div class="flex flex-col gap-8">
              @for (method of returnedMethods; track method.name) {
                <div class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900">
                  <div
                    class="grid grid-cols-1 gap-2 rounded-lg md:grid-cols-4 md:gap-6"
                  >
                    <div class="flex flex-col items-start gap-2">
                      <code>{{ method.name }}()</code>
                    </div>
                    <div class="flex-col gap-4 md:col-span-3">
                      <p class="text-sm">{{ method.description }}</p>

                      @if (method.parameters.length > 0) {
                        <div class="mt-4">
                          <h6>Parameters</h6>
                          <div class="flex flex-col gap-2">
                            @for (
                              param of method.parameters;
                              track param.name
                            ) {
                              <div class="flex flex-row items-center gap-4">
                                <code class="whitespace-nowrap"
                                  >{{ param.name }}: {{ param.type }}</code
                                >
                                <span class="flex-1 text-sm">{{
                                  param.description
                                }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <div class="mt-4">
                        <h6>Returns</h6>
                        <div class="flex flex-row items-center gap-4">
                          <code class="whitespace-nowrap">{{
                            method.returnType
                          }}</code>
                          <span class="flex-1 text-sm">{{
                            method.returnDescription
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3>Options</h3>
        @let interfaces = apiDoc().interfaces;

        <div class="mt-4 flex flex-col gap-4">
          @for (interface of interfaces; track interface.name) {
            <div class="card flex-col">
              <h4>{{ interface.name }}</h4>
              <p>{{ interface.description }}</p>

              <div class="flex flex-col gap-8">
                @for (property of interface.properties; track property.name) {
                  <div
                    class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900"
                  >
                    <div
                      class="grid grid-cols-1 gap-2 rounded-lg  md:grid-cols-4 md:gap-6"
                    >
                      <div class="flex flex-col items-start gap-2">
                        <code>{{ property.name }}: {{ property.type }}</code>
                      </div>
                      <div class="flex-col gap-4 md:col-span-3">
                        <p class="text-sm">
                          {{ property.description }}
                          @if (property.defaultValue) {
                            <div class="pt-4">
                              Default value
                              <code>{{ property.defaultValue }}</code>
                            </div>
                          }
                        </p>
                      </div>
                    </div>
                    @if (property.properties?.length) {
                      <div class="mt-10 ml-8 flex flex-col gap-10">
                        @for (
                          subprop of property.properties;
                          track subprop.name
                        ) {
                          <div
                            class="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-6"
                          >
                            <div class="flex flex-col items-start gap-2">
                              <code class="whitespace-nowrap"
                                >{{ subprop.name }}: {{ subprop.type }}</code
                              >
                            </div>
                            <div class="md:col-span-3 md:-ml-6">
                              <p class="text-sm">
                                {{ subprop.description }}
                                @if (subprop.defaultValue) {
                                  <div class="pt-4">
                                    Default value
                                    <code>{{ subprop.defaultValue }}</code>
                                  </div>
                                }
                                @if (subprop.properties?.length) {
                                  <div class="mt-8">
                                    <div class="flex flex-col gap-4">
                                      @for (
                                        subsubprop of subprop.properties;
                                        track subsubprop.name
                                      ) {
                                        <div class="flex flex-row gap-4">
                                          <div>
                                            <code class="whitespace-nowrap"
                                              >{{ subsubprop.name }}:
                                              {{ subsubprop.type }}</code
                                            >
                                          </div>
                                          <span class=" flex-1">{{
                                            subsubprop.description
                                          }}</span>
                                        </div>
                                      }
                                    </div>
                                  </div>
                                }
                              </p>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
      <div>
        <h3>Types</h3>
        @let types = apiDoc().types;

        <div class="mt-4 flex flex-col gap-4">
          @for (type of types; track type.name) {
            <div class="card flex-col">
              <h4>{{ type.name }}</h4>
              <p>{{ type.description }}</p>

              @for (value of type.values; track value.name) {
                <div class="flex items-center gap-2">
                  <code>{{ value.name }}</code>
                  <p class="text-sm">{{ value.description }}</p>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div>
        <h3>Generics</h3>
        @let generics = apiDoc().generics;

        <div class="mt-4 flex flex-col gap-4">
          <div class="card flex-col">
            <div class="flex flex-col gap-8">
              @for (generic of generics; track generic.name) {
                <div class="rounded-lg p-4 odd:bg-gray-50 dark:odd:bg-gray-900">
                  <div
                    class="grid grid-cols-1 gap-2 rounded-lg md:grid-cols-4 md:gap-6"
                  >
                    <div class="flex flex-col items-start gap-2">
                      <code>{{ generic.name }}: {{ generic.type }}</code>
                    </div>
                    <div class="flex-col gap-4 md:col-span-3">
                      <p class="text-sm">
                        {{ generic.description }}
                        @if (generic.defaultValue) {
                          <div class="pt-4">
                            Default value
                            <code>{{ generic.defaultValue }}</code>
                          </div>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
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
export class ApiComponent {
  // API Documentation Data
  apiDoc = signal<ApiDocumentation>({
    mainFunction: {
      name: 'restResource',
      description:
        'Creates a resource management system for RESTful APIs in Angular, providing functionality for CRUD operations with different strategies.',
      parameters: [
        {
          name: 'apiEndpoint',
          type: 'string',
          description: 'The base URL for the REST API endpoint.',
          isOptional: false,
        },
        {
          name: 'options',
          type: 'RestResourceOptions<T, ID>',
          description: 'Configuration options for the resource.',
          isOptional: true,
          defaultValue: '{}',
        },
      ],
      returnType: 'Object',
      returnDescription:
        'An object containing signals and methods for managing the resource.',
    },
    returnedProperties: [
      {
        name: 'loadingInitial',
        type: 'Signal<boolean>',
        description:
          'Signal indicating whether the initial data is being loaded.',
      },
      {
        name: 'loading',
        type: 'Signal<boolean>',
        description: 'Signal indicating whether any operation is in progress.',
      },
      {
        name: 'loadingCreate',
        type: 'Signal<boolean>',
        description:
          'Signal indicating whether a create operation is in progress.',
      },
      {
        name: 'loadingUpdate',
        type: 'Signal<boolean>',
        description:
          'Signal indicating whether an update operation is in progress.',
      },
      {
        name: 'loadingRemove',
        type: 'Signal<boolean>',
        description:
          'Signal indicating whether a remove operation is in progress.',
      },
      {
        name: 'errorRead',
        type: 'Signal<E | undefined>',
        description:
          'Signal containing any error that occurred during a read operation.',
      },
      {
        name: 'errorCreate',
        type: 'Signal<E | undefined>',
        description:
          'Signal containing any error that occurred during a create operation.',
      },
      {
        name: 'errorUpdate',
        type: 'Signal<E | undefined>',
        description:
          'Signal containing any error that occurred during an update operation.',
      },
      {
        name: 'errorRemove',
        type: 'Signal<E | undefined>',
        description:
          'Signal containing any error that occurred during a remove operation.',
      },
      {
        name: 'value',
        type: 'Signal<T | undefined>',
        description:
          'The value of the resource, ONLY if the resource is a single item. This is useful when building a resource to manage a single entity, e.g., detail view.',
      },
      {
        name: 'values',
        type: 'Signal<T[] | undefined>',
        description: 'The values of the resource (e.g., list of 0 to n items).',
      },
      {
        name: 'hasValue',
        type: 'Signal<boolean>',
        description:
          'Signal indicating whether the resource has a single value.',
      },
      {
        name: 'hasValues',
        type: 'Signal<boolean>',
        description: 'Signal indicating whether the resource has any values.',
      },
    ],
    returnedMethods: [
      {
        name: 'reload',
        description: 'Reloads the resource data from the server.',
        parameters: [],
        returnType: 'void',
        returnDescription: 'No return value.',
      },
      {
        name: 'create',
        description: 'Creates a new item in the resource.',
        parameters: [
          {
            name: 'item',
            type: 'Partial<T>',
            description: 'The item to create.',
            isOptional: false,
          },
        ],
        returnType: 'void',
        returnDescription: 'No return value.',
      },
      {
        name: 'update',
        description: 'Updates an existing item in the resource.',
        parameters: [
          {
            name: 'item',
            type: 'T',
            description: 'The item to update.',
            isOptional: false,
          },
        ],
        returnType: 'void',
        returnDescription: 'No return value.',
      },
      {
        name: 'remove',
        description: 'Removes an item from the resource.',
        parameters: [
          {
            name: 'item',
            type: 'T',
            description: 'The item to remove.',
            isOptional: false,
          },
        ],
        returnType: 'void',
        returnDescription: 'No return value.',
      },
      {
        name: 'destroy',
        description: 'Destroys the resource and cleans up any subscriptions.',
        parameters: [],
        returnType: 'void',
        returnDescription: 'No return value.',
      },
    ],
    types: [
      {
        name: 'Strategy',
        description: 'Strategy for handling resource requests.',
        values: [
          {
            name: 'optimistic',
            description: 'Update UI immediately and assume success',
          },
          {
            name: 'pessimistic',
            description:
              'Wait for server response, then reload the entire collection',
          },
          {
            name: 'incremental',
            description:
              'Patch returned item into the existing collection after server confirms',
          },
        ],
      },
      {
        name: 'Behavior',
        description:
          'Defines how requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request.',
        values: [
          {
            name: 'concat',
            description: 'Queues requests and processes them sequentially',
          },
          {
            name: 'merge',
            description: 'Processes requests in parallel as they arrive',
          },
          {
            name: 'switch',
            description: 'Cancels previous requests when a new one arrives',
          },
          {
            name: 'exhaust',
            description: 'Ignores new requests until the current one completes',
          },
        ],
      },
      {
        name: 'RequestType',
        description: 'Type of request that can be made to the resource.',
        values: [
          {
            name: 'create',
            description: 'Creates a new resource item on the server',
          },
          {
            name: 'update',
            description: 'Updates an existing resource item on the server',
          },
          {
            name: 'remove',
            description: 'Removes a resource item from the server',
          },
        ],
      },
    ],
    generics: [
      {
        name: 'T',
        type: 'Type',
        description:
          'The type of the resource items being managed. This is a generic type parameter that should be specified when using the resource.',
      },
      {
        name: 'ID',
        type: 'Type',
        description:
          'The type of the ID field for the resource items. This is typically a string or number.',
      },
      {
        name: 'E',
        type: 'Type',
        description:
          'The type of error that can be returned by the API. This is a generic type parameter that can be specified when using the resource.',
      },
    ],
    interfaces: [
      {
        name: 'RestResourceOptions<T, ID>',
        description: 'Configuration options for the resource.',
        properties: [
          {
            name: 'verbose',
            type: 'boolean',
            description:
              "Whether to log verbose information to the console. This is useful for debugging and understanding the resource's behavior.",
            defaultValue: 'false',
          },
          {
            name: 'params',
            type: '() => string | undefined',
            description:
              'A reactive function which determines the request to be made. Whenever the params change, the loader will be triggered to fetch a new value for the resource.',
          },
          {
            name: 'idSelector',
            type: '(item: T) => ID',
            description:
              'Function to extract the ID from an item when the ID is not stored in the `id` field. Used to identify items for update and remove operations.',
          },
          {
            name: 'strategy',
            type: 'Strategy',
            description:
              'The default strategy for the resource for every request type, it can be overridden by the request-type specific strategy.',
            defaultValue: 'pessimistic',
          },
          {
            name: 'create',
            type: 'Object',
            description: 'Configuration options for create operations.',
            properties: [
              {
                name: 'behavior',
                type: 'Behavior',
                description:
                  'Defines how create requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request.',
                defaultValue: 'concat',
              },
              {
                name: 'strategy',
                type: 'Strategy',
                description:
                  'Determines whether changes are applied optimistically (before server confirmation) or pessimistically (after server confirmation) for create operations.',
                defaultValue: 'The value of the global strategy option',
              },
              {
                name: 'id',
                type: 'Object',
                description:
                  'Optionally generate a new item ID (if the target API does not handle this) and set it on the item.',
                properties: [
                  {
                    name: 'generator',
                    type: '() => ID',
                    description:
                      'A function that generates a new unique ID. Used when the backend does not assign one automatically.',
                  },
                  {
                    name: 'setter',
                    type: '(id: ID, item: Partial<T>) => void',
                    description:
                      "Custom logic for assigning the generated ID to the item, especially useful when the item's ID field is not named `id`.",
                  },
                ],
              },
            ],
          },
          {
            name: 'update',
            type: 'Object',
            description: 'Configuration options for update operations.',
            properties: [
              {
                name: 'behavior',
                type: 'Behavior',
                description:
                  'Defines how update requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request.',
                defaultValue: 'concat',
              },
              {
                name: 'strategy',
                type: 'Strategy',
                description:
                  'Determines whether changes are applied optimistically (before server confirmation) or pessimistically (after server confirmation) for update operations.',
                defaultValue: 'The value of the global strategy option',
              },
            ],
          },
          {
            name: 'remove',
            type: 'Object',
            description: 'Configuration options for remove operations.',
            properties: [
              {
                name: 'behavior',
                type: 'Behavior',
                description:
                  'Defines how remove requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request.',
                defaultValue: 'concat',
              },
              {
                name: 'strategy',
                type: 'Strategy',
                description:
                  'Determines whether changes are applied optimistically (before server confirmation) or pessimistically (after server confirmation) for remove operations.',
                defaultValue: 'The value of the global strategy option',
              },
            ],
          },
        ],
      },
    ],
  });
}

// API Documentation Interfaces
interface ApiParameter {
  name: string;
  type: string;
  description: string;
  isOptional: boolean;
  defaultValue?: string;
}

interface ApiMethod {
  name: string;
  description: string;
  parameters: ApiParameter[];
  returnType: string;
  returnDescription: string;
}

interface ApiProperty {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  properties?: ApiProperty[];
}

interface ApiType {
  name: string;
  description: string;
  values?: { name: string; description: string }[];
}

interface ApiInterface {
  name: string;
  description: string;
  properties: ApiProperty[];
}

interface ApiFunction {
  name: string;
  description: string;
  parameters: ApiParameter[];
  returnType: string;
  returnDescription: string;
}

interface ApiDocumentation {
  mainFunction: ApiFunction;
  types: ApiType[];
  interfaces: ApiInterface[];
  returnedProperties: ApiProperty[];
  returnedMethods: ApiMethod[];
  generics?: ApiProperty[];
}
