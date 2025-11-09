import { createMemo, createSignal } from 'solid-js';
import { bench, describe } from 'vitest';
import { zenV7b } from './zen-v7b';
import { zenV10Hybrid } from './zen-v10-hybrid';

/**
 * V10-Hybrid Benchmark - Static Dependencies + Push-based
 *
 * 架構特點：
 * - Static dependencies (first-run only tracking) - 避免 cleanup 開銷
 * - Push-based updates - 避免遞歸 needsUpdate 開銷
 * - 遞歸 downstream marking - 正確處理鏈式依賴
 * - 極簡化實現 - 最小化對象分配
 */

describe('V10-Hybrid vs V7b vs SolidJS', () => {
  // ========================================================================
  // 1. Basic Read
  // ========================================================================
  describe('Basic Read', () => {
    bench('[V10-Hybrid] signal read', () => {
      const { signal } = zenV10Hybrid;
      const count = signal(0);
      for (let i = 0; i < 1000; i++) {
        count();
      }
    });

    bench('[V7b] signal read', () => {
      const { signal } = zenV7b;
      const count = signal(0);
      for (let i = 0; i < 1000; i++) {
        count();
      }
    });

    bench('[Solid] signal read', () => {
      const [count] = createSignal(0);
      for (let i = 0; i < 1000; i++) {
        count();
      }
    });
  });

  // ========================================================================
  // 2. Basic Write
  // ========================================================================
  describe('Basic Write', () => {
    bench('[V10-Hybrid] signal write', () => {
      const { signal } = zenV10Hybrid;
      const count = signal(0);
      for (let i = 0; i < 1000; i++) {
        count(i);
      }
    });

    bench('[V7b] signal write', () => {
      const { signal } = zenV7b;
      const count = signal(0);
      for (let i = 0; i < 1000; i++) {
        count(i);
      }
    });

    bench('[Solid] signal write', () => {
      const [, setCount] = createSignal(0);
      for (let i = 0; i < 1000; i++) {
        setCount(i);
      }
    });
  });

  // ========================================================================
  // 3. Computed Read
  // ========================================================================
  describe('Computed Read', () => {
    bench('[V10-Hybrid] computed read', () => {
      const { signal, computed } = zenV10Hybrid;
      const count = signal(0);
      const doubled = computed(() => count() * 2);
      for (let i = 0; i < 1000; i++) {
        doubled();
      }
    });

    bench('[V7b] computed read', () => {
      const { signal, computed } = zenV7b;
      const count = signal(0);
      const doubled = computed(() => count() * 2);
      for (let i = 0; i < 1000; i++) {
        doubled();
      }
    });

    bench('[Solid] memo read', () => {
      const [count] = createSignal(0);
      const doubled = createMemo(() => count() * 2);
      for (let i = 0; i < 1000; i++) {
        doubled();
      }
    });
  });

  // ========================================================================
  // 4. Diamond Dependency
  // ========================================================================
  describe('Diamond Dependency', () => {
    bench('[V10-Hybrid] diamond', () => {
      const { signal, computed } = zenV10Hybrid;
      const a = signal(0);
      const b = computed(() => a() * 2);
      const c = computed(() => a() + 10);
      const d = computed(() => (b() ?? 0) + (c() ?? 0));

      for (let i = 0; i < 1000; i++) {
        a(i);
        d();
      }
    });

    bench('[V7b] diamond', () => {
      const { signal, computed } = zenV7b;
      const a = signal(0);
      const b = computed(() => a() * 2);
      const c = computed(() => a() + 10);
      const d = computed(() => (b() ?? 0) + (c() ?? 0));

      for (let i = 0; i < 1000; i++) {
        a(i);
        d();
      }
    });

    bench('[Solid] diamond', () => {
      const [a, setA] = createSignal(0);
      const b = createMemo(() => a() * 2);
      const c = createMemo(() => a() + 10);
      const d = createMemo(() => b() + c());

      for (let i = 0; i < 1000; i++) {
        setA(i);
        d();
      }
    });
  });

  // ========================================================================
  // 5. 5-Level Chain
  // ========================================================================
  describe('5-Level Chain', () => {
    bench('[V10-Hybrid] 5-level chain', () => {
      const { signal, computed } = zenV10Hybrid;
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => (b() ?? 0) + 10);
      const d = computed(() => (c() ?? 0) / 2);
      const e = computed(() => (d() ?? 0) - 1);
      const f = computed(() => (e() ?? 0) * 3);

      for (let i = 0; i < 1000; i++) {
        a(i);
        f();
      }
    });

    bench('[V7b] 5-level chain', () => {
      const { signal, computed } = zenV7b;
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => (b() ?? 0) + 10);
      const d = computed(() => (c() ?? 0) / 2);
      const e = computed(() => (d() ?? 0) - 1);
      const f = computed(() => (e() ?? 0) * 3);

      for (let i = 0; i < 1000; i++) {
        a(i);
        f();
      }
    });

    bench('[Solid] 5-level chain', () => {
      const [a, setA] = createSignal(1);
      const b = createMemo(() => a() * 2);
      const c = createMemo(() => b() + 10);
      const d = createMemo(() => c() / 2);
      const e = createMemo(() => d() - 1);
      const f = createMemo(() => e() * 3);

      for (let i = 0; i < 1000; i++) {
        setA(i);
        f();
      }
    });
  });
});
