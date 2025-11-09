/**
 * V8 Benchmark - Testing Bidirectional Slots Optimization
 *
 * Focus: Complex dependency graphs where O(1) cleanup matters
 */

import { bench, describe } from "vitest";
import { createSignal as solidSignal, createMemo as solidMemo } from "solid-js";
import { zenV4 } from "./zen-v4";
import { zenV7b } from "./zen-v7b";
import { zenV8 } from "./zen-v8";

// =============================================================================
// Complex Graphs - Where Bidirectional Slots Shine
// =============================================================================

describe("🔥 Diamond Dependency (100x)", () => {
  bench("Zen V4", () => {
    const a = zenV4.signal(1);
    const b = zenV4.computed(() => a() * 2);
    const c = zenV4.computed(() => a() + 10);
    const d = zenV4.computed(() => b()! + c()!);

    for (let i = 0; i < 100; i++) {
      a(i);
      d();
    }
  });

  bench("Zen V7b", () => {
    const a = zenV7b.signal(1);
    const b = zenV7b.computed(() => a() * 2);
    const c = zenV7b.computed(() => a() + 10);
    const d = zenV7b.computed(() => b()! + c()!);

    for (let i = 0; i < 100; i++) {
      a(i);
      d();
    }
  });

  bench("Zen V8 (Bidirectional Slots)", () => {
    const a = zenV8.signal(1);
    const b = zenV8.computed(() => a() * 2);
    const c = zenV8.computed(() => a() + 10);
    const d = zenV8.computed(() => b()! + c()!);

    for (let i = 0; i < 100; i++) {
      a.set(i);
      d();
    }
  });

  bench("Solid", () => {
    const [a, setA] = solidSignal(1);
    const b = solidMemo(() => a() * 2);
    const c = solidMemo(() => a() + 10);
    const d = solidMemo(() => b() + c());

    for (let i = 0; i < 100; i++) {
      setA(i);
      d();
    }
  });
});

describe("🔥 5-Level Deep Tree (100x)", () => {
  bench("Zen V4", () => {
    const a = zenV4.signal(1);
    const b = zenV4.computed(() => a() * 2);
    const c = zenV4.computed(() => b()! + 10);
    const d = zenV4.computed(() => c()! / 2);
    const e = zenV4.computed(() => d()! - 1);

    for (let i = 0; i < 100; i++) {
      a(i);
      e();
    }
  });

  bench("Zen V7b", () => {
    const a = zenV7b.signal(1);
    const b = zenV7b.computed(() => a() * 2);
    const c = zenV7b.computed(() => b()! + 10);
    const d = zenV7b.computed(() => c()! / 2);
    const e = zenV7b.computed(() => d()! - 1);

    for (let i = 0; i < 100; i++) {
      a(i);
      e();
    }
  });

  bench("Zen V8 (Bidirectional Slots)", () => {
    const a = zenV8.signal(1);
    const b = zenV8.computed(() => a() * 2);
    const c = zenV8.computed(() => b()! + 10);
    const d = zenV8.computed(() => c()! / 2);
    const e = zenV8.computed(() => d()! - 1);

    for (let i = 0; i < 100; i++) {
      a.set(i);
      e();
    }
  });

  bench("Solid", () => {
    const [a, setA] = solidSignal(1);
    const b = solidMemo(() => a() * 2);
    const c = solidMemo(() => b() + 10);
    const d = solidMemo(() => c() / 2);
    const e = solidMemo(() => d() - 1);

    for (let i = 0; i < 100; i++) {
      setA(i);
      e();
    }
  });
});

describe("🔥 3-Level Chain (1000x)", () => {
  bench("Zen V4", () => {
    const a = zenV4.signal(1);
    const b = zenV4.computed(() => a() * 2);
    const c = zenV4.computed(() => b()! + 10);
    const d = zenV4.computed(() => c()! / 2);

    for (let i = 0; i < 1000; i++) {
      a(i);
      d();
    }
  });

  bench("Zen V7b", () => {
    const a = zenV7b.signal(1);
    const b = zenV7b.computed(() => a() * 2);
    const c = zenV7b.computed(() => b()! + 10);
    const d = zenV7b.computed(() => c()! / 2);

    for (let i = 0; i < 1000; i++) {
      a(i);
      d();
    }
  });

  bench("Zen V8 (Bidirectional Slots)", () => {
    const a = zenV8.signal(1);
    const b = zenV8.computed(() => a() * 2);
    const c = zenV8.computed(() => b()! + 10);
    const d = zenV8.computed(() => c()! / 2);

    for (let i = 0; i < 1000; i++) {
      a.set(i);
      d();
    }
  });

  bench("Solid", () => {
    const [a, setA] = solidSignal(1);
    const b = solidMemo(() => a() * 2);
    const c = solidMemo(() => b() + 10);
    const d = solidMemo(() => c() / 2);

    for (let i = 0; i < 1000; i++) {
      setA(i);
      d();
    }
  });
});

// =============================================================================
// Base Operations - Should be similar to V4/V7b
// =============================================================================

describe("Read Performance (1000x)", () => {
  bench("Zen V4", () => {
    const count = zenV4.signal(0);
    for (let i = 0; i < 1000; i++) {
      count();
    }
  });

  bench("Zen V7b", () => {
    const count = zenV7b.signal(0);
    for (let i = 0; i < 1000; i++) {
      count();
    }
  });

  bench("Zen V8", () => {
    const count = zenV8.signal(0);
    for (let i = 0; i < 1000; i++) {
      count();
    }
  });

  bench("Solid", () => {
    const [count] = solidSignal(0);
    for (let i = 0; i < 1000; i++) {
      count();
    }
  });
});

describe("Write Performance (1000x)", () => {
  bench("Zen V4", () => {
    const count = zenV4.signal(0);
    for (let i = 0; i < 1000; i++) {
      count(i);
    }
  });

  bench("Zen V7b", () => {
    const count = zenV7b.signal(0);
    for (let i = 0; i < 1000; i++) {
      count(i);
    }
  });

  bench("Zen V8", () => {
    const count = zenV8.signal(0);
    for (let i = 0; i < 1000; i++) {
      count.set(i);
    }
  });

  bench("Solid", () => {
    const [, setCount] = solidSignal(0);
    for (let i = 0; i < 1000; i++) {
      setCount(i);
    }
  });
});

describe("Computed Cached Read (1000x)", () => {
  bench("Zen V4", () => {
    const a = zenV4.signal(1);
    const b = zenV4.computed(() => a() * 2);

    for (let i = 0; i < 1000; i++) {
      b();
    }
  });

  bench("Zen V7b", () => {
    const a = zenV7b.signal(1);
    const b = zenV7b.computed(() => a() * 2);

    for (let i = 0; i < 1000; i++) {
      b();
    }
  });

  bench("Zen V8", () => {
    const a = zenV8.signal(1);
    const b = zenV8.computed(() => a() * 2);

    for (let i = 0; i < 1000; i++) {
      b();
    }
  });

  bench("Solid", () => {
    const [a] = solidSignal(1);
    const b = solidMemo(() => a() * 2);

    for (let i = 0; i < 1000; i++) {
      b();
    }
  });
});
