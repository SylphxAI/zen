import { describe, expect, it } from 'bun:test';
import { transformRapidJSX } from './core/transform.js';

describe('transformRapidJSX', () => {
  describe('signal auto-unwrap', () => {
    it('should NOT transform {signal} (runtime handles it)', () => {
      const input = `
        const message = signal('hello');
        <Text>{message}</Text>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Should remain as message in children, not wrapped in arrow function
      expect(result!.code).toContain('children: message');
      expect(result!.code).not.toContain('() => message');
    });

    it('should transform {signal.value} to {() => signal.value}', () => {
      const input = `
        const message = signal('hello');
        <Text>{message.value}</Text>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      expect(result!.code).toContain('() => message.value');
    });

    it('should NOT transform {() => signal.value} (already a function)', () => {
      const input = `
        const message = signal('hello');
        <Text>{() => message.value}</Text>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Should remain as arrow function, not double-wrapped
      expect(result!.code).toContain('() => message.value');
      expect(result!.code).not.toContain('() => () => message.value');
    });

    it('should only transform .value accesses', () => {
      const input = `
        const count = signal(0);
        const message = signal('hello');
        <div>
          <Text>{count}</Text>
          <Text>{message.value}</Text>
        </div>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // {count} should NOT be transformed (runtime handles it)
      expect(result!.code).toContain('children: count');
      expect(result!.code).not.toContain('() => count');
      // {message.value} should be transformed
      expect(result!.code).toContain('() => message.value');
    });

    it('should transform complex expressions containing .value', () => {
      const input = `
        const count = signal(0);
        <div>
          <Text>{count.value + 2}</Text>
          <Text>{count.value * 10}</Text>
          <Text>{count.value > 5 ? 'high' : 'low'}</Text>
        </div>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // All expressions containing .value should be transformed
      expect(result!.code).toContain('() => count.value + 2');
      expect(result!.code).toContain('() => count.value * 10');
      expect(result!.code).toContain('() => count.value > 5');
    });

    it('should NOT transform plain variables', () => {
      const input = `
        const name = 'John';
        const age = 30;
        <div>
          <Text>{name}</Text>
          <Text>{age + 5}</Text>
        </div>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Plain variables should NOT be transformed to arrow functions
      expect(result!.code).toContain('children: name');
      expect(result!.code).toContain('children: age + 5');
      expect(result!.code).not.toContain('() => name');
      expect(result!.code).not.toContain('() => age');
    });
  });

  describe('auto-lazy children', () => {
    it('should transform <Show><Child /></Show> to lazy children', () => {
      const input = `
        <Show when={condition}>
          <Child />
        </Show>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Check that it contains Show and Child in JSX runtime format
      expect(result!.code).toContain('Show');
      expect(result!.code).toContain('Child');
    });

    it('should transform <For> children', () => {
      const input = `
        <For each={items}>
          <Item />
        </For>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Check that it contains For and Item in JSX runtime format
      expect(result!.code).toContain('For');
      expect(result!.code).toContain('Item');
    });

    it('should NOT transform regular components', () => {
      const input = `
        <Box>
          <Child />
        </Box>
      `;

      const result = transformRapidJSX(input, 'test.tsx');
      expect(result).not.toBeNull();
      // Should contain Box and Child
      expect(result!.code).toContain('Box');
      expect(result!.code).toContain('Child');
    });
  });

  describe('options', () => {
    it('should respect autoUnwrap: false', () => {
      const input = `
        <Text>{message}</Text>
      `;

      const result = transformRapidJSX(input, 'test.tsx', { autoUnwrap: false });
      expect(result).not.toBeNull();
      // Should NOT transform to arrow function
      expect(result!.code).not.toContain('() =>');
    });

    it('should respect autoLazy: false', () => {
      const input = `
        <Show when={condition}>
          <Child />
        </Show>
      `;

      const result = transformRapidJSX(input, 'test.tsx', { autoLazy: false });
      expect(result).not.toBeNull();
      // Should contain Show component
      expect(result!.code).toContain('Show');
    });
  });
});
