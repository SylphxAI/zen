import { describe, expect, it, vi } from 'vitest';
import { parseKey } from '../hooks/useInput.js';
import { signal } from '../index';
import { MultiSelect, type MultiSelectOption, handleMultiSelectInput } from './MultiSelect';

// Helper to create parsed key and input
const pk = (input: string) => parseKey(input);

const items: MultiSelectOption[] = [
  { label: 'Item 1', value: 'item1' },
  { label: 'Item 2', value: 'item2' },
  { label: 'Item 3', value: 'item3' },
  { label: 'Item 4', value: 'item4' },
];

describe('MultiSelect', () => {
  it('should create multiselect node with Box component', () => {
    const node = MultiSelect({ items });

    expect(node).toBeDefined();
    expect(node.type).toBe('box');
  });

  it('should accept selected as array', () => {
    const node = MultiSelect({ items, selected: ['item1', 'item2'] });

    expect(node).toBeDefined();
  });

  it('should accept selected as signal', () => {
    const selected = signal<string[]>(['item1']);
    const node = MultiSelect({ items, selected });

    expect(node).toBeDefined();
  });

  it('should default to empty selection', () => {
    const node = MultiSelect({ items });

    expect(node).toBeDefined();
  });

  it('should generate unique ID if not provided', () => {
    const node1 = MultiSelect({ items });
    const node2 = MultiSelect({ items });

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();
  });

  it('should use provided ID', () => {
    const node = MultiSelect({ items, id: 'custom-multiselect' });

    expect(node).toBeDefined();
  });

  it('should accept highlightedIndex signal', () => {
    const highlightedIndex = signal(1);
    const node = MultiSelect({ items, highlightedIndex });

    expect(node).toBeDefined();
  });

  it('should apply custom styles', () => {
    const node = MultiSelect({ items, style: { borderColor: 'green' } });

    expect(node).toBeDefined();
    expect(node.style?.borderColor).toBe('green');
  });
});

describe('handleMultiSelectInput', () => {
  it('should move highlight up with up key', () => {
    const highlightedIndex = signal(2);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk('\x1b[A').key,
      pk('\x1b[A').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
    expect(highlightedIndex.value).toBe(1);
  });

  it('should move highlight up with k key', () => {
    const highlightedIndex = signal(2);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk('k').key,
      pk('k').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(highlightedIndex.value).toBe(1);
  });

  it('should not move highlight before first item', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk('\x1b[A').key,
      pk('\x1b[A').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(highlightedIndex.value).toBe(0);
  });

  it('should move highlight down with down key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk('\x1b[B').key,
      pk('\x1b[B').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
    expect(highlightedIndex.value).toBe(1);
  });

  it('should move highlight down with j key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk('j').key,
      pk('j').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(highlightedIndex.value).toBe(1);
  });

  it('should not move highlight past last item', () => {
    const highlightedIndex = signal(3);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk('\x1b[B').key,
      pk('\x1b[B').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(highlightedIndex.value).toBe(3);
  });

  it('should toggle selection with space key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk(' ').key,
      pk(' ').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
    expect(selected.value).toContain('item1');
  });

  it('should toggle selection with space string', () => {
    const highlightedIndex = signal(1);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk(' ').key,
      pk(' ').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(selected.value).toContain('item2');
  });

  it('should deselect already selected item', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>(['item1', 'item2']);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk(' ').key,
      pk(' ').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(selected.value).not.toContain('item1');
    expect(selected.value).toContain('item2');
  });

  it('should submit selection with enter key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>(['item1', 'item3']);
    const scrollOffset = signal(0);
    const onSubmit = vi.fn();

    const handled = handleMultiSelectInput(
      pk('\r').key,
      pk('\r').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
      4,
      onSubmit,
    );

    expect(handled).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith(['item1', 'item3']);
  });

  it('should submit selection with return key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>(['item2']);
    const scrollOffset = signal(0);
    const onSubmit = vi.fn();

    handleMultiSelectInput(
      pk('\r').key,
      pk('\r').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
      4,
      onSubmit,
    );

    expect(onSubmit).toHaveBeenCalledWith(['item2']);
  });

  it('should select all with a key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk('a').key,
      pk('a').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
    expect(selected.value).toEqual(['item1', 'item2', 'item3', 'item4']);
  });

  it('should clear all with c key', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>(['item1', 'item2']);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk('c').key,
      pk('c').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
    expect(selected.value).toEqual([]);
  });

  it('should scroll down when highlighting beyond visible area', () => {
    const highlightedIndex = signal(1);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);
    const limit = 2;

    // Move to item 2 (index 2), should trigger scroll
    handleMultiSelectInput(
      pk('\x1b[B').key,
      pk('\x1b[B').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
      limit,
    );

    expect(highlightedIndex.value).toBe(2);
    expect(scrollOffset.value).toBe(1);
  });

  it('should scroll up when highlighting before visible area', () => {
    const highlightedIndex = signal(2);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(1);
    const limit = 2;

    // Move to item 1 (index 1), should trigger scroll up
    handleMultiSelectInput(
      pk('\x1b[A').key,
      pk('\x1b[A').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
      limit,
    );

    expect(highlightedIndex.value).toBe(1);
    expect(scrollOffset.value).toBe(1);
  });

  it('should work without onSubmit callback', () => {
    const highlightedIndex = signal(0);
    const selected = signal<string[]>([]);
    const scrollOffset = signal(0);

    const handled = handleMultiSelectInput(
      pk('\r').key,
      pk('\r').input,
      highlightedIndex,
      selected,
      scrollOffset,
      items,
    );

    expect(handled).toBe(true);
  });

  it('should handle numeric values', () => {
    const numericItems: MultiSelectOption<number>[] = [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 },
    ];
    const highlightedIndex = signal(1);
    const selected = signal<number[]>([]);
    const scrollOffset = signal(0);

    handleMultiSelectInput(
      pk(' ').key,
      pk(' ').input,
      highlightedIndex,
      selected,
      scrollOffset,
      numericItems,
    );

    expect(selected.value).toContain(2);
  });
});
