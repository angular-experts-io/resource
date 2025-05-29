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
      <h3>Types</h3>
      @let types = apiDoc().types;

      <div class="flex flex-col gap-4">
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
    types: [
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
        name: 'Strategy',
        description: 'Strategy for handling resource requests.',
        values: [
          {
            name: 'optimistic',
            description: 'Update UI immediately and assume success',
          },
          {
            name: 'pessimistic',
            description: 'Wait for server response, then reload the entire collection',
          },
          {
            name: 'incremental',
            description: 'Patch returned item into the existing collection after server confirms',
          },
        ],
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
}
