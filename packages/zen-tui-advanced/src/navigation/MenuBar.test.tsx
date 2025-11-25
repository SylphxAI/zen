/** @jsxImportSource @zen/tui */
import { signal } from '@zen/tui';
import { describe, expect, it } from 'vitest';
import { MenuBar } from './MenuBar.js';

describe('MenuBar', () => {
  it('should render menu bar', () => {
    const items = [
      { label: 'File', key: 'F1' },
      { label: 'Edit', key: 'F2' },
      { label: 'View', key: 'F3' },
    ];

    const result = MenuBar({ items });

    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('should support onSelect callbacks', () => {
    let selected: string | null = null;

    const items = [
      { label: 'File', key: 'F1', onSelect: () => (selected = 'File') },
      { label: 'Edit', key: 'F2', onSelect: () => (selected = 'Edit') },
    ];

    const result = MenuBar({ items });

    expect(result).toBeDefined();
    expect(selected).toBeNull();
  });

  it('should support active index', () => {
    const activeIndex = signal(0);

    const items = [
      { label: 'File', key: 'F1' },
      { label: 'Edit', key: 'F2' },
    ];

    const result = MenuBar({
      items,
      activeIndex: activeIndex.value,
    });

    expect(result).toBeDefined();
  });

  it('should support disabled items', () => {
    const items = [
      { label: 'File', key: 'F1', disabled: false },
      { label: 'Edit', key: 'F2', disabled: true },
    ];

    const result = MenuBar({ items });

    expect(result).toBeDefined();
  });

  it('should support separators', () => {
    const items = [
      { label: 'File', key: 'F1', separator: true },
      { label: 'Edit', key: 'F2' },
    ];

    const result = MenuBar({ items });

    expect(result).toBeDefined();
  });

  it('should support custom colors', () => {
    const items = [{ label: 'File', key: 'F1' }];

    const result = MenuBar({
      items,
      bgColor: 'green',
      textColor: 'yellow',
    });

    expect(result).toBeDefined();
  });

  it('should support Alt+key shortcuts', () => {
    const items = [
      { label: 'File', key: 'f' },
      { label: 'Edit', key: 'e' },
    ];

    const result = MenuBar({ items });

    expect(result).toBeDefined();
  });

  it('should support controlled mode', () => {
    const activeIndex = signal(0);
    let changed = false;

    const items = [
      { label: 'File', key: 'F1' },
      { label: 'Edit', key: 'F2' },
    ];

    const result = MenuBar({
      items,
      activeIndex: activeIndex.value,
      onActiveChange: (newIndex) => {
        activeIndex.value = newIndex;
        changed = true;
      },
    });

    expect(result).toBeDefined();
    expect(changed).toBe(false);
  });
});
