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
  template: `
    <div class="api-container">
      <h1>&#64;angular-experts/resource API</h1>

      <section>
        <h2>Functions</h2>
        @for (method of methods(); track method.name) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ method.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ method.description }}</p>
              <pre><code>{{ method.signature }}</code></pre>

              @if (method.parameters.length > 0) {
                <h3>Parameters</h3>
                <div class="params-grid">
                  <div class="param-header">Name</div>
                  <div class="param-header">Type</div>
                  <div class="param-header">Description</div>

                  @for (param of method.parameters; track param.name) {
                    <div class="param-name">
                      {{ param.name }}{{ param.optional ? '?' : '' }}
                    </div>
                    <div class="param-type">{{ param.type }}</div>
                    <div
                      class="param-description"
                      [innerHTML]="param.description"
                    ></div>
                  }
                </div>
              }

              <h3>Returns</h3>
              <div class="returns-grid">
                <div class="param-header">Type</div>
                <div class="param-header">Description</div>

                <div class="param-type">{{ method.returns.type }}</div>
                <div
                  class="param-description"
                  [innerHTML]="method.returns.description"
                ></div>
              </div>

              @if (
                method.returns.properties &&
                method.returns.properties.length > 0
              ) {
                <h4>Return Object Properties</h4>
                <div class="properties-grid">
                  <div class="param-header">Name</div>
                  <div class="param-header">Type</div>
                  <div class="param-header">Description</div>

                  @for (prop of method.returns.properties; track prop.name) {
                    <div class="param-name">{{ prop.name }}</div>
                    <div class="param-type">{{ prop.type }}</div>
                    <div
                      class="param-description"
                      [innerHTML]="prop.description"
                    ></div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      </section>

      <mat-divider></mat-divider>

      <section>
        <h2>Interfaces</h2>
        @for (interface of interfaces(); track interface.name) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{ interface.name }}
              </mat-panel-title>
            </mat-expansion-panel-header>

            <p class="description">{{ interface.description }}</p>

            <h3>Properties</h3>
            <div class="properties-grid">
              <div class="param-header">Name</div>
              <div class="param-header">Type</div>
              <div class="param-header">Description</div>

              @for (prop of interface.properties; track prop.name) {
                <div class="param-name">
                  {{ prop.name }}{{ prop.optional ? '?' : '' }}
                </div>
                <div class="param-type">{{ prop.type }}</div>
                <div
                  class="param-description"
                  [innerHTML]="prop.description"
                ></div>
              }
            </div>
          </mat-expansion-panel>
        }
      </section>

      <mat-divider></mat-divider>

      <section>
        <h2>Types</h2>
        @for (type of types(); track type.name) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ type.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ type.description }}</p>
              @if (type.values) {
                <div>
                  <h3>Values</h3>
                  <div class="values-grid">
                    @for (value of type.values; track value) {
                      <div class="value-item">{{ value }}</div>
                    }
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 1rem;
    }

    .api-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    section {
      margin-bottom: 2rem;
    }

    h1,
    h2 {
      margin-bottom: 1rem;
    }

    h3 {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    h4 {
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    mat-card,
    mat-expansion-panel {
      margin-bottom: 1rem;
    }

    pre {
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      border: 1px solid transparent;
    }

    mat-divider {
      margin: 2rem 0;
    }

    .description {
      max-width: 100%;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .description-list {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      padding-left: 1.5rem;
    }

    .description-list li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    /* Grid layouts for tabular data */
    .params-grid,
    .returns-grid,
    .properties-grid {
      display: grid;
      margin-bottom: 1.5rem;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid transparent;
    }

    .params-grid {
      grid-template-columns: minmax(120px, auto) minmax(120px, auto) 1fr;
    }

    .returns-grid {
      grid-template-columns: minmax(120px, auto) 1fr;
    }

    .properties-grid {
      grid-template-columns: minmax(120px, auto) minmax(120px, auto) 1fr;
      /* Add more whitespace between individual properties */
      margin-top: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Add more whitespace between individual properties in interfaces */
    .properties-grid > .param-description:nth-child(3n) {
      margin-bottom: 1.5rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      margin-bottom: 1.5rem;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid transparent;
    }

    .param-header {
      font-weight: bold;
      padding: 0.5rem;
      border: 1px solid transparent;
    }

    .param-name {
      font-weight: bold;
      padding: 0.5rem;
      border: 1px solid transparent;
    }

    .param-type {
      color: #673ab7;
      padding: 0.5rem;
      border: 1px solid transparent;
    }

    .param-description {
      line-height: 1.5;
      padding: 0.5rem;
      border: 1px solid transparent;
    }

    .value-item {
      padding: 0.5rem;
      border: 1px solid transparent;
    }

    /* Format multi-line descriptions with proper line breaks */
    .param-description ul,
    .description ul {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      padding-left: 1.5rem;
    }

    .param-description li,
    .description li {
      margin-bottom: 0.5rem;
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
              'Signal containing the array of items returned from the API. Implemented using linkedSignal to maintain previous values when source is undefined during reload because the params have changed (to prevent jumpy UI)',
          },
          {
            name: 'value',
            type: 'Signal<T | undefined>',
            description:
              'Signal containing the first item from the values array, if there is only one item.',
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
            description:
              'Signal indicating whether the resource has any values.',
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
            'A reactive function which determines the request to be made. Whenever the params change, the loader will be triggered to fetch a new value for the resource.',
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
            'The default strategy for the resource for every request type, it can be overridden by the request type specific strategy. Default is "pessimistic".',
          optional: true,
        },
        {
          name: 'create',
          type: 'Object',
          description: `Configuration options specific to create operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how create requests are handled when multiple requests are made (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically or pessimistically (default: global strategy)</li>
<li><strong>id</strong>: Object for ID generation with generator and optional setter functions</li>
</ul>`,
          optional: true,
        },
        {
          name: 'update',
          type: 'Object',
          description: `Configuration options specific to update operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how update requests are handled when multiple requests are made (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically or pessimistically (default: global strategy)</li>
</ul>`,
          optional: true,
        },
        {
          name: 'remove',
          type: 'Object',
          description: `Configuration options specific to remove operations. Properties include:<ul>
<li><strong>behavior</strong>: Defines how remove requests are handled when multiple requests are made (default: 'concat')</li>
<li><strong>strategy</strong>: Determines whether changes are applied optimistically or pessimistically (default: global strategy)</li>
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
        'Determines whether changes are applied optimistically (before server confirmation) or pessimistically (after server confirmation).',
      values: ['optimistic', 'pessimistic'],
    },
  ]);
}
