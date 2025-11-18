/**
 * ZenJS For Component
 *
 * High-performance keyed list rendering with fine-grained updates
 *
 * Features:
 * - Keyed reconciliation (only updates changed items)
 * - Efficient DOM operations (minimal moves)
 * - Memory efficient (reuses nodes)
 */

import { effect } from '@zen/signal';
import type { AnyZen } from '@zen/signal';
import { onCleanup, disposeNode } from '../lifecycle.js';

interface ForProps<T, U extends Node> {
  each: T[] | AnyZen;
  children: (item: T, index: () => number) => U;
  fallback?: Node;
}

/**
 * For component - Keyed list rendering
 *
 * @example
 * <For each={items}>
 *   {(item, index) => <div>{item.name}</div>}
 * </For>
 */
export function For<T, U extends Node>(props: ForProps<T, U>): Node {
  const { each, children, fallback } = props;

  // Anchor comment node to mark position
  const marker = document.createComment('for');

  // Track rendered items
  const items = new Map<T, { node: U; index: number }>();

  // Get parent for DOM operations
  let parent: Node | null = null;

  // Effect to update list
  const dispose = effect(() => {
    // Handle signal, function, or plain array
    let array: T[];
    if (typeof each === 'function') {
      array = each();
    } else if (each && typeof each === 'object' && '_value' in each && '_kind' in each) {
      // It's a signal
      array = (each as any).value;
    } else {
      array = each as T[];
    }

    // Show fallback if empty
    if (array.length === 0 && fallback) {
      // Clear existing items
      for (const [, { node }] of items) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        disposeNode(node);
      }
      items.clear();

      // Insert fallback
      if (!parent) parent = marker.parentNode;
      if (parent) {
        parent.insertBefore(fallback, marker);
      }
      return;
    }

    // Remove fallback if present
    if (fallback?.parentNode) {
      fallback.parentNode.removeChild(fallback);
    }

    if (!parent) parent = marker.parentNode;
    if (!parent) return;

    // Build new items map
    const newItems = new Map<T, { node: U; index: number }>();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      let entry = items.get(item);

      if (entry) {
        // Reuse existing node
        entry.index = i;
        newItems.set(item, entry);
      } else {
        // Create new node
        const node = children(item, () => {
          const entry = newItems.get(item);
          return entry ? entry.index : -1;
        });

        entry = { node, index: i };
        newItems.set(item, entry);
      }

      fragment.appendChild(entry.node);
    }

    // Remove items no longer in array
    for (const [item, { node }] of items) {
      if (!newItems.has(item)) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        disposeNode(node);
      }
    }

    // Update items map
    items.clear();
    for (const [item, entry] of newItems) {
      items.set(item, entry);
    }

    // Insert all nodes in correct order
    parent.insertBefore(fragment, marker);

    return undefined;
  });

  // Register cleanup via owner system
  onCleanup(() => {
    dispose();
    for (const [, { node }] of items) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      disposeNode(node);
    }
    items.clear();
  });

  return marker;
}
