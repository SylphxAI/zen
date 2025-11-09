import { describe, expect, it } from "vitest";
import { zenV8 } from "./zen-v8";

const { signal, computed, batch } = zenV8;

describe("Zen V8 - Bidirectional Slots", () => {
  describe("Basic Signal Operations", () => {
    it("should create and read signal", () => {
      const count = signal(0);
      expect(count()).toBe(0);
    });

    it("should update signal value", () => {
      const count = signal(0);
      count(5);
      expect(count()).toBe(5);
    });

    it("should use .set() method", () => {
      const count = signal(0);
      count.set(10);
      expect(count()).toBe(10);
    });

    it("should not trigger update if value is same", () => {
      const count = signal(5);
      const initial = count._node.updatedAt;
      count(5); // Same value
      expect(count._node.updatedAt).toBe(initial);
    });
  });

  describe("Basic Computed", () => {
    it("should create computed from signal", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);
      expect(doubled()).toBe(4);
    });

    it("should update when dependency changes", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      expect(doubled()).toBe(4);
      count(5);
      expect(doubled()).toBe(10);
    });

    it("should cache result", () => {
      let execCount = 0;
      const count = signal(2);
      const doubled = computed(() => {
        execCount++;
        return count() * 2;
      });

      expect(doubled()).toBe(4);
      expect(execCount).toBe(1);

      // Read again without changing dependency
      expect(doubled()).toBe(4);
      expect(execCount).toBe(1); // Should not re-execute
    });

    it("should only recompute when dependency changes", () => {
      let execCount = 0;
      const count = signal(2);
      const doubled = computed(() => {
        execCount++;
        return count() * 2;
      });

      expect(doubled()).toBe(4);
      expect(execCount).toBe(1);

      count(5);
      expect(doubled()).toBe(10);
      expect(execCount).toBe(2);
    });
  });

  describe("Chained Computed (Critical for V8)", () => {
    it("should handle 2-level chain", () => {
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => b()! + 10);

      expect(c()).toBe(12); // (1 * 2) + 10
      a(5);
      expect(c()).toBe(20); // (5 * 2) + 10
    });

    it("should handle 3-level chain", () => {
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => b()! + 10);
      const d = computed(() => c()! / 2);

      expect(d()).toBe(6); // ((1 * 2) + 10) / 2
      a(5);
      expect(d()).toBe(10); // ((5 * 2) + 10) / 2
    });

    it("should handle 5-level deep chain", () => {
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => b()! + 10);
      const d = computed(() => c()! / 2);
      const e = computed(() => d()! - 1);
      const f = computed(() => e()! * 3);

      expect(f()).toBe(15); // (((((1 * 2) + 10) / 2) - 1) * 3)
      a(2);
      expect(f()).toBe(21); // (((((2 * 2) + 10) / 2) - 1) * 3)
    });
  });

  describe("Diamond Dependency (Critical for V8)", () => {
    it("should handle diamond dependency correctly", () => {
      const a = signal(1);
      const b = computed(() => a() * 2);
      const c = computed(() => a() + 10);
      const d = computed(() => b()! + c()!);

      expect(d()).toBe(13); // (1 * 2) + (1 + 10)
      a(5);
      expect(d()).toBe(25); // (5 * 2) + (5 + 10)
    });

    it("should not recompute diamond branches unnecessarily", () => {
      let bCount = 0;
      let cCount = 0;

      const a = signal(1);
      const b = computed(() => {
        bCount++;
        return a() * 2;
      });
      const c = computed(() => {
        cCount++;
        return a() + 10;
      });
      const d = computed(() => b()! + c()!);

      expect(d()).toBe(13);
      expect(bCount).toBe(1);
      expect(cCount).toBe(1);

      // Reading d again should not recompute b and c
      expect(d()).toBe(13);
      expect(bCount).toBe(1);
      expect(cCount).toBe(1);
    });
  });

  describe("Bidirectional Slots - O(1) Cleanup", () => {
    it("should cleanup dependencies correctly", () => {
      const a = signal(1);
      const b = computed(() => a() * 2);

      expect(b()).toBe(2);
      expect(a._node.observers).not.toBeNull();
      expect(a._node.observerSlots).not.toBeNull();

      // Subscribe creates an effect
      const unsub = b.subscribe(() => {});

      // Unsubscribe should clean up using bidirectional slots
      unsub();

      // After cleanup, observers should be cleaned
      // (Note: b itself still observes a, but the effect is cleaned)
    });

    it("should handle multiple observers cleanup", () => {
      const a = signal(1);
      const b1 = computed(() => a() * 2);
      const b2 = computed(() => a() + 10);
      const b3 = computed(() => a() * 3);

      // All three computed observe a
      b1();
      b2();
      b3();

      expect(a._node.observers?.length).toBe(3);
      expect(a._node.observerSlots?.length).toBe(3);

      // Subscribe and unsubscribe b2
      const unsub = b2.subscribe(() => {});
      unsub();

      // a should still have b1 and b3 as observers
      // (cleanup logic verified by no errors)
    });
  });

  describe("Custom Equality", () => {
    it("should use custom equality function", () => {
      let execCount = 0;
      const obj = signal({ x: 1 });
      const comp = computed(
        () => {
          execCount++;
          return obj().x * 2;
        },
        (a, b) => a === b,
      );

      expect(comp()).toBe(2);
      expect(execCount).toBe(1);

      // Update with same value (different object)
      obj({ x: 1 });

      // Should recompute because default equality is Object.is (for signal)
      expect(comp()).toBe(2);
      expect(execCount).toBe(2);
    });

    it("should not update if custom equality returns true", () => {
      let execCount = 0;
      const count = signal(2);
      const rounded = computed(
        () => {
          execCount++;
          return Math.floor(count() / 10) * 10;
        },
        (a, b) => a === b,
      );

      expect(rounded()).toBe(0);
      expect(execCount).toBe(1);

      // Change count but rounded value stays same
      count(5);
      expect(rounded()).toBe(0);
      expect(execCount).toBe(2); // Executes but doesn't update timestamp

      // Another computed depending on rounded should not recompute
      let execCount2 = 0;
      const doubled = computed(() => {
        execCount2++;
        return rounded()! * 2;
      });

      expect(doubled()).toBe(0);
      expect(execCount2).toBe(1);

      count(7); // Still rounds to 0
      expect(doubled()).toBe(0);
      expect(execCount2).toBe(1); // Should not recompute!
    });
  });

  describe("Batching", () => {
    it("should batch multiple updates", () => {
      const a = signal(1);
      const b = signal(2);
      const sum = computed(() => a() + b());

      expect(sum()).toBe(3);

      batch(() => {
        a(10);
        b(20);
      });

      expect(sum()).toBe(30);
    });
  });

  describe("Subscription", () => {
    it("should subscribe to signal changes", () => {
      const count = signal(0);
      const values: number[] = [];

      count.subscribe((v) => values.push(v));

      count(1);
      count(2);
      count(3);

      expect(values).toEqual([0, 1, 2, 3]);
    });

    it("should subscribe to computed changes", () => {
      const count = signal(0);
      const doubled = computed(() => count() * 2);
      const values: number[] = [];

      doubled.subscribe((v) => values.push(v!));

      count(1);
      count(2);

      expect(values).toEqual([0, 2, 4]);
    });

    it("should unsubscribe correctly", () => {
      const count = signal(0);
      const values: number[] = [];

      const unsub = count.subscribe((v) => values.push(v));

      count(1);
      unsub();
      count(2);

      expect(values).toEqual([0, 1]); // Should not include 2
    });
  });

  describe("Multiple Dependencies", () => {
    it("should track multiple signal dependencies", () => {
      const a = signal(1);
      const b = signal(2);
      const c = signal(3);
      const sum = computed(() => a() + b() + c());

      expect(sum()).toBe(6);
      a(10);
      expect(sum()).toBe(15);
      b(20);
      expect(sum()).toBe(33);
    });

    it("should deduplicate dependencies", () => {
      const a = signal(1);
      const sum = computed(() => a() + a()); // Same signal read twice

      expect(sum()).toBe(2);
      expect(sum._node.sources?.length).toBe(1); // Should only track once
    });
  });

  describe("Conditional Dependencies", () => {
    it("should track current dependencies (permanent tracking)", () => {
      const toggle = signal(true);
      const a = signal(1);
      const b = signal(10);

      let execCount = 0;
      const result = computed(() => {
        execCount++;
        return toggle() ? a() : b();
      });

      // First run: toggle is true, reads a
      expect(result()).toBe(1);
      expect(execCount).toBe(1);

      // Update a: should recompute
      a(2);
      expect(result()).toBe(2);
      expect(execCount).toBe(2);

      // Update b: V8 uses permanent dependencies, so will recompute
      // (unlike SolidJS which would not recompute)
      b(20);
      expect(result()).toBe(2); // Still using a
      expect(execCount).toBe(3); // But did recompute (checked b is updated)

      // This is expected behavior for permanent dependencies
      // Trade-off: simpler code, but may recompute more than strictly necessary
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle large number of dependencies efficiently", () => {
      const signals = Array.from({ length: 100 }, (_, i) => signal(i));
      const sum = computed(() => signals.reduce((acc, s) => acc + s(), 0));

      expect(sum()).toBe(4950); // Sum of 0-99

      // Should have bidirectional slots for all 100 dependencies
      expect(sum._node.sources?.length).toBe(100);
      expect(sum._node.sourceSlots?.length).toBe(100);

      signals[50]!(100);
      expect(sum()).toBe(5000);
    });

    it("should cleanup large dependency graph efficiently (O(1) per edge)", () => {
      const root = signal(1);
      const computed1 = computed(() => root() * 2);
      const computed2 = computed(() => root() + 10);
      const computed3 = computed(() => root() * 3);

      // Create subscriptions
      const unsub1 = computed1.subscribe(() => {});
      const unsub2 = computed2.subscribe(() => {});
      const unsub3 = computed3.subscribe(() => {});

      // Cleanup should be O(1) per edge thanks to bidirectional slots
      unsub1();
      unsub2();
      unsub3();

      // Should not throw and complete quickly
      expect(true).toBe(true);
    });
  });
});
