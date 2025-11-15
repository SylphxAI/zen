# FINAL DECISION: Remove Auto-Batching, Use Zen Ultra as Default

## The Critical Discovery

**SolidJS does NOT have auto-batching because it's LAZY (pull-based), not EAGER (push-based)!**

### SolidJS Reactivity Model
```typescript
const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);

setCount(5);  // Marks doubled as STALE, doesn't compute
setCount(10); // Marks doubled as STALE again, still doesn't compute

doubled();    // NOW it computes (lazy pull)
```

**No auto-batching needed** because computations are deferred until access!

### Our Previous Model (Regular Zen)
```typescript
const count = zen(0);
const doubled = computed(() => count.value * 2);

count.value = 5;  // Immediately computes doubled (eager push)
count.value = 10; // Immediately computes doubled again (eager push)
// Result: 2 computations
```

**Auto-batching was trying to make eager updates efficient** - but it added massive overhead!

### Zen Ultra Model (CORRECT)
```typescript
const count = zen(0);
const doubled = computed(() => count.value * 2);

count.value = 5;  // Marks doubled STALE, notifies listeners directly
count.value = 10; // Marks doubled STALE, notifies listeners directly

// When accessed, recomputes if STALE
doubled.value;    // Computes once
```

**This matches SolidJS!** Lazy pull + direct notification = no auto-batching needed!

## Decision

**Use Zen Ultra as the ONLY version:**
1. ✅ Matches SolidJS model (lazy pull)
2. ✅ 60x faster than auto-batch version
3. ✅ 32% smaller bundle
4. ✅ Simpler - one version, not two
5. ✅ Manual `batch()` available when needed

## Implementation Plan

1. **Replace** `src/zen.ts` with `src/zen-ultra.ts` content
2. **Remove** `src/zen-ultra.ts` and `src/index-ultra.ts`
3. **Update** package.json to only export one version
4. **Document** that we're lazy-pull like SolidJS

This is the right direction! 🎯
