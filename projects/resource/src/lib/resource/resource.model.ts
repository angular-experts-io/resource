export type RequestType = 'create' | 'update' | 'remove';
export type Behavior = 'concat' | 'merge' | 'switch' | 'exhaust';

/**
 *  Strategy for handling resource requests
 *
 * - `'pessimistic'` - wait for server response, then reload the entire collection
 * - `'optimistic'` - update UI immediately and assume success
 * - `'incremental'` - patch returned item into the existing collection after server confirms
 */
export type Strategy = 'optimistic' | 'pessimistic' | 'incremental';

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
   * it can be overridden by the request-type specific strategy
   *
   * - `'pessimistic'` - wait for server response, then reload the entire collection
   * - `'optimistic'` - update UI immediately and assume success
   * - `'incremental'` - patch returned item into the existing collection after server confirms
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

export const LOG_PREFIX = `[@angular-experts/resource]`;
