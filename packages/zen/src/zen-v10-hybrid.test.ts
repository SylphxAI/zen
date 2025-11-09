import { describe, expect, it } from "vitest";
import { zenV10Hybrid } from "./zen-v10-hybrid";

const { signal, computed, batch } = zenV10Hybrid;

describe("Zen V10-Hybrid - Static Dependencies + Push-based", () => {
  it("should handle basic signal operations", () => {
    const count = signal(0);
    expect(count()).toBe(0);

    count(5);
    expect(count()).toBe(5);
  });

  it("should handle basic computed", () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(4);

    count(5);
    expect(doubled()).toBe(10);
  });

  it("should handle 2-level chain", () => {
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => b()! + 10);

    expect(c()).toBe(12);
    a(5);
    expect(c()).toBe(20);
  });

  it("should handle 3-level chain", () => {
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => b()! + 10);
    const d = computed(() => c()! / 2);

    expect(d()).toBe(6);
    a(5);
    expect(d()).toBe(10);
  });

  it("should handle 5-level deep chain", () => {
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => b()! + 10);
    const d = computed(() => c()! / 2);
    const e = computed(() => d()! - 1);
    const f = computed(() => e()! * 3);

    expect(f()).toBe(15);
    a(2);
    expect(f()).toBe(18);
  });

  it("should handle diamond dependency", () => {
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => a() + 10);
    const d = computed(() => b()! + c()!);

    expect(d()).toBe(13);
    a(5);
    expect(d()).toBe(25);
  });
});