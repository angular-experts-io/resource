import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

interface ApiMethod {
  name: string;
  description: string;
  signature: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
  returns: {
    type: string;
    description: string;
    properties?: {
      name: string;
      type: string;
      description: string;
    }[];
  };
}

interface ApiInterface {
  name: string;
  description: string;
  properties: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
}

interface ApiType {
  name: string;
  description: string;
  values?: string[];
}

@Component({
  selector: 'showcase-api',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, MatExpansionModule, MatListModule],
  template: ``,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiComponent {
  methods = signal<ApiMethod[]>([
    {
      name: 'restResource',
      description:
        'Creates a resource for managing CRUD operations with a REST API endpoint.',
      signature:
        'restResource<T, ID, E = any>(apiEndpoint: string, options?: RestResourceOptions<T, ID>)',
      parameters: [
        {
          name: 'apiEndpoint',
          type: 'string',
          description: 'The base URL for the REST API endpoint.',
        },
        {
          name: 'options',
          type: 'RestResourceOptions<T, ID>',
          description: 'Configuration options for the resource.',
          optional: true,
        },
      ],
      returns: {
        type: 'Object',
        description:
          'An object containing loading states, error states, data signals, and CRUD methods.',
        properties: [
          {
            name: 'loadingInitial',
            type: 'Signal<boolean>',
            description:
              'Signal indicating whether the initial data is being loaded.',
          },
          {
            name: 'loading',
            type: 'Signal<boolean>',
            description:
              'Signal indicating whether any operation is in progress.',
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
            name: 'errorCreate',
            type: 'Signal<E | undefined>',
            description:
              'Signal containing the error from the last create operation, if any.',
          },
          {
            name: 'errorUpdate',
            type: 'Signal<E | undefined>',
            description:
              'Signal containing the error from the last update operation, if any.',
          },
          {
            name: 'errorRemove',
            type: 'Signal<E | undefined>',
            description:
              'Signal containing the error from the last remove operation, if any.',
          },
          {
            name: 'errorRead',
            type: 'Signal<E | undefined>',
            description:
              'Signal containing the error from the last read operation, if any.',
          },
          {
            name: 'values',
            type: 'Signal<T[]>',
            description:
              'The values of the resource (list of 0 to n items). Implemented using linkedSignal to maintain previous values when source is undefined during reload because the params have changed (to prevent jumpy UI).',
          },
          {
            name: 'value',
            type: 'Signal<T | undefined>',
            description:
              'The value of the resource, ONLY if the resource is a single item. This is useful when building a resource to manage a single entity, eg detail view. Returns undefined if resource has more than one item.',
          },
          {
            name: 'hasValue',
            type: 'Signal<boolean>',
            description:
              'Signal indicating whether the resource has a single value (value is not null and not undefined).',
          },
          {
            name: 'hasValues',
            type: 'Signal<boolean>',
            description:
              'Signal indicating whether the resource has any values (length > 0).',
          },
          {
            name: 'create',
            type: '(item: Partial<T>) => void',
            description: 'Method to create a new item.',
          },
          {
            name: 'update',
            type: '(item: T) => void',
            description: 'Method to update an existing item.',
          },
          {
            name: 'remove',
            type: '(item: T) => void',
            description: 'Method to remove an existing item.',
          },
          {
            name: 'destroy',
            type: '() => void',
            description:
              'Method to destroy the resource and clean up subscriptions.',
          },
          {
            name: 'reload',
            type: '() => void',
            description: 'Method to reload the resource data.',
          },
        ],
      },
    },
  ]);

  interfaces = signal<ApiInterface[]>([
    {
      name: 'RestResourceOptions<T, ID>',
      description: 'Configuration options for a REST resource.',
      properties: [
        {
          name: 'verbose',
          type: 'boolean',
          description:
            "Whether to log verbose information to the console. This is useful for debugging and understanding the resource's behavior. Default is false.",
          optional: true,
        },
        {
          name: 'params',
          type: '() => string | undefined',
          description:
            "A reactive function which determines the request to be made. Whenever the params change, the loader will be triggered to fetch a new value for the resource. (works the same way as Angular's `resource`)",
          optional: true,
        },
        {
          name: 'idSelector',
          type: '(item: T) => ID',
          description:
            'Function to extract the ID from an item when the ID is not stored in the `id` field. Used to identify items for update and remove operations.',
          optional: true,
        },
        {
          name: 'strategy',
          type: 'Strategy',
          description:
            'The default strategy for the resource for every request type, it can be overridden by the request-type specific strategy. Options are: "optimistic" (update UI immediately and assume success), "pessimistic" (wait for server response, then reload the entire collection), or "incremental" (patch returned item into the existing collection after server confirms). Default is "pessimistic".',
          optional: true,
        },
        {
          name: 'create',
          type: 'Object',
          description: `Configuration options specific to create operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how create requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request. (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically (before server confirmation), pessimistically (after server confirmation), or incrementally (patch returned item into the existing collection) for create operations. (default: global strategy)</li>
<li><strong>id</strong>: Object for ID generation with generator and optional setter functions. Useful when the backend does not assign IDs automatically.</li>
<li><strong>id.generator</strong>: A function that returns a new ID (e.g., UUID or auto-increment).</li>
<li><strong>id.setter</strong>: (Optional) A function that sets the generated ID onto the item, especially useful when the item's ID field is not named 'id'.</li>
</ul>`,
          optional: true,
        },
        {
          name: 'update',
          type: 'Object',
          description: `Configuration options specific to update operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how update requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request. (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically (before server confirmation), pessimistically (after server confirmation), or incrementally (patch returned item into the existing collection) for update operations. (default: global strategy)</li>
</ul>`,
          optional: true,
        },
        {
          name: 'remove',
          type: 'Object',
          description: `Configuration options specific to remove operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how remove requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request. (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically (before server confirmation), pessimistically (after server confirmation), or incrementally (patch returned item into the existing collection) for remove operations. (default: global strategy)</li>
</ul>`,
          optional: true,
        },
      ],
    },
    {
      name: 'ResourceRef<T>',
      description: 'Reference to a resource with loading state and value.',
      properties: [
        {
          name: 'value',
          type: 'Signal<T | undefined>',
          description: 'Signal containing the current value of the resource.',
        },
        {
          name: 'isLoading',
          type: 'Signal<boolean>',
          description:
            'Signal indicating whether the resource is currently loading.',
        },
        {
          name: 'reload',
          type: '() => void',
          description: 'Method to reload the resource data.',
        },
        {
          name: 'update',
          type: '(updater: (value: T | undefined) => T | undefined) => void',
          description:
            'Method to update the resource value using an updater function.',
        },
      ],
    },
  ]);

  types = signal<ApiType[]>([
    {
      name: 'RequestType',
      description: 'Type of request operation.',
      values: ['create', 'update', 'remove'],
    },
    {
      name: 'Behavior',
      description:
        'Defines how requests are handled when multiple requests are made. Controls the RxJS flattening operator used for the HTTP request.',
      values: ['concat', 'merge', 'switch', 'exhaust'],
    },
    {
      name: 'Strategy',
      description:
        'Strategy for handling resource requests: optimistic (update UI immediately and assume success), pessimistic (wait for server response, then reload the entire collection), or incremental (patch returned item into the existing collection after server confirms).',
      values: ['optimistic', 'pessimistic', 'incremental'],
    },
  ]);
}
