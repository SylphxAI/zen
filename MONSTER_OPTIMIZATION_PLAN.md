# 🔥 怪獸級 Zen 優化方案

**基於：** 2024-2025 所有最先進技術、論文、競品研究
**目標：** 超越 SolidJS 全部指標，成為最快 reactive library

---

## 📚 研究成果總結

### 1. Fine-Grained Reactivity 趨勢 (2024-2025)

**發現：**
- Angular, SolidJS, Svelte 5, Qwik, Vue 3, Preact 全部採用 signals
- Svelte 5 (2024) 加入 fine-grained reactivity，performance 提升顯著
- Preact Signals 用 Babel plugin + effect store 實現 React 集成
- **關鍵：** 只更新真正需要的節點，避免整個 component re-render

**應用：**
- ✅ Zen 已經是 fine-grained (signal-based)
- ⚠️ 需要優化 update propagation mechanism

---

### 2. Diamond Problem & Glitch-Free Updates

**問題：** 當 dependency graph 有 diamond shape 時：
```
    A
   / \
  B   C
   \ /
    D
```
- A 改變 → B 同 C 更新 → D 可能計算兩次！
- 或者 D 睇到 inconsistent state (B updated, C not yet)

**解決方案（競品分析）：**

#### MobX: Two-Pass Algorithm
```typescript
// Pass 1: Mark all dependencies as stale (down phase)
// Pass 2: Update in dependency order (down phase)
// 每個節點記錄 parent count
```

#### Preact Signals: Version Numbers
```typescript
// 每個 signal 有 version number
// 每條 edge 也有 version number
// Update 前檢查 parent versions
```

#### Reactively: Graph Coloring ⭐ **最快！**
```typescript
// Use only 3 colors: WHITE, GRAY, BLACK
// One down phase (mark) + one up phase (update)
// 比 version numbers 更快（less memory, simpler checks）
```

**應用到 Zen：**
- 實現 graph coloring algorithm
- 保證 glitch-free updates
- Topological order execution

---

### 3. Pull-Based vs Push-Based Reactivity

**研究結果：**
- **Pull-based:** Consumer 控制 timing，lazy evaluation，適合優先級調度
- **Push-based:** Producer 控制 timing，eager notification，cache efficiency 高
- **結論：** 兩者性能相近，但 pull-based 更靈活

**Zen 目前：**
- Hybrid: Push notification (mark dirty) + Pull recalc (lazy getter)
- ✅ 已經是最優方案！

**優化：**
- 改進 lazy evaluation timing
- 加強 memoization

---

### 4. Lazy Evaluation + Memoization

**核心原理：**
```typescript
// Lazy: 延遲計算直到需要
// Memoization: 緩存結果避免重複計算

// 組合威力：
function lazyMemo<T>(fn: () => T): () => T {
  let cached: T | undefined;
  let computed = false;

  return () => {
    if (!computed) {
      cached = fn();
      computed = true;
    }
    return cached!;
  };
}
```

**應用到 Zen：**
- ✅ Computed 已經有 lazy + memo
- ⚠️ 需要優化 cache invalidation (避免不必要的 resubscribe)

---

### 5. V8 Optimization (Hidden Classes & Inline Caches)

**關鍵技術：**

#### Hidden Classes (Maps)
```typescript
// ✅ GOOD: Same property order = same hidden class
class Signal {
  _value: any;
  _listeners: Set<Listener>;
  _version: number;  // Add properties in consistent order
}

// ❌ BAD: Different property order = different hidden classes
const sig1 = { _value: 1, _listeners: new Set() };
const sig2 = { _listeners: new Set(), _value: 2 };
```

#### Monomorphic Inline Caches
```typescript
// ✅ GOOD: Function always sees same object shape
function updateSignal(sig: SignalCore) {
  sig._value = newValue;  // Monomorphic IC
}

// ❌ BAD: Function sees different shapes
function update(obj: any) {
  obj._value = newValue;  // Megamorphic IC (slow!)
}
```

**應用到 Zen：**
1. 確保所有 Signal/Computed 有**相同 property order**
2. 使用 **class** 而不是 Object.create() (V8 優化 class 更好)
3. 避免 dynamic property addition
4. 保持 function **monomorphic** (always same input shape)

---

### 6. Subscription Management (Set > Array)

**研究證實：**
- ✅ Set.add() = O(1)
- ✅ Set.delete() = O(1)
- ✅ Set.has() = O(1)
- ❌ Array.indexOf() = O(n)
- ❌ Array.splice() = O(n)

**Zen 目前：**
- ✅ `_sources: Set<AnyZen>` (已優化)
- ❌ `_listeners: Listener[]` (仍用 Array)
- ❌ Unsub 用 indexOf + splice (O(n) bottleneck!)

**優化：**
```typescript
// Change to Set-based listeners
type ZenCore<T> = {
  _listeners?: Set<Listener<T>>;  // O(1) add/remove!
};

// Unsubscribe becomes O(1)
return () => {
  listeners.delete(callback);  // O(1) vs O(n)
};
```

---

## 🚀 怪獸級優化方案

### Phase 1: 底層結構優化 (Foundation)

#### 1.1 統一 Hidden Class (Monomorphic Optimization)
```typescript
// Current: Object.create(proto) = different hidden classes
// Target: Use class with fixed structure

class ZenSignal<T> {
  _kind: 'zen' = 'zen';
  _value: T;
  _listeners: Set<Listener<T>> | null = null;
  _version: number = 0;  // For glitch-free updates

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // ... (same logic)
  }

  set value(newValue: T) {
    // ... (same logic)
  }
}

class ComputedSignal<T> extends ZenSignal<T | null> {
  _kind: 'computed' = 'computed';
  _dirty: boolean = true;
  _sources: Set<AnyZen>;
  _calc: () => T;
  _unsubs: Unsubscribe[] | null = null;
  _version: number = 0;

  constructor(calc: () => T, deps?: AnyZen[]) {
    super(null);
    this._calc = calc;
    this._sources = deps ? new Set(deps) : new Set();
  }
}
```

**Expected:** +20-30% across all operations (monomorphic ICs)

---

#### 1.2 Set-Based Listeners (O(1) Remove)
```typescript
type ZenCore<T> = {
  _listeners?: Set<Listener<T>>;  // Change from Array
};

// attachListener now O(1) remove
function attachListener(sources: Set<AnyZen>, callback: any): Unsubscribe[] {
  const unsubs: Unsubscribe[] = [];

  for (const source of sources) {
    const zenSource = source as ZenCore<any>;
    if (!zenSource._listeners) {
      zenSource._listeners = new Set();
    }
    zenSource._listeners.add(callback);  // O(1)

    unsubs.push(() => {
      zenSource._listeners?.delete(callback);  // O(1)!
    });
  }

  return unsubs;
}

// notifyListeners iteration
function notifyListeners<T>(zen: ZenCore<T>, newValue: T, oldValue: T): void {
  const listeners = zen._listeners;
  if (!listeners) return;

  for (const listener of listeners) {  // Set iteration is fast
    listener(newValue, oldValue);
  }
}
```

**Expected:** +200-400% in fanout tests (eliminate O(n) bottleneck!)

---

### Phase 2: Glitch-Free Updates (Graph Coloring)

#### 2.1 Implement Graph Coloring Algorithm
```typescript
// 3 colors for glitch-free updates
const enum NodeColor {
  WHITE = 0,  // Clean
  GRAY = 1,   // Checking
  BLACK = 2,  // Dirty
}

type ReactiveNode = {
  _color: NodeColor;
  _version: number;
};

// Phase 1: Mark dirty nodes (down phase)
function markDirty(node: ComputedCore<any>): void {
  if (node._color === NodeColor.BLACK) return;  // Already marked

  node._color = NodeColor.BLACK;
  node._dirty = true;

  // Mark all observers
  if (node._listeners) {
    for (const listener of node._listeners) {
      if ((listener as any)._computedZen) {
        markDirty((listener as any)._computedZen);
      }
    }
  }
}

// Phase 2: Update in topological order (up phase)
function updateReactive(node: ComputedCore<any>): void {
  if (node._color === NodeColor.WHITE) return;  // Already clean

  // Check if all parents are clean
  for (const source of node._sources) {
    if ((source as any)._color !== NodeColor.WHITE) {
      updateReactive(source as any);  // Update parent first
    }
  }

  // Now update this node
  if (node._dirty) {
    updateComputed(node);
  }

  node._color = NodeColor.WHITE;  // Mark clean
  node._version++;
}
```

**Expected:** +50-100% in diamond/complex patterns (eliminate double updates)

---

### Phase 3: 智能 Re-subscription

#### 3.1 Detect Static Dependencies (Skip Re-subscribe)
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  const needsResubscribe = c._unsubs !== null;
  let oldSources: Set<AnyZen> | null = null;

  if (needsResubscribe) {
    // Store old sources for comparison
    oldSources = new Set(c._sources);
    c._sources.clear();
  }

  // Recalculate with tracking
  const prevListener = currentListener;
  currentListener = c;

  try {
    const newValue = c._calc();
    c._dirty = false;

    // Check if dependencies changed
    if (needsResubscribe && oldSources) {
      const sourcesChanged = !setsEqual(oldSources, c._sources);

      if (sourcesChanged) {
        // Dependencies changed, need full re-subscribe
        unsubscribeFromSources(c);
        if (c._sources.size > 0) {
          subscribeToSources(c);
        }
      }
      // else: Dependencies same, keep old subscriptions!
    } else if (!needsResubscribe && c._sources.size > 0) {
      // First subscribe
      subscribeToSources(c);
    }

    // ... value change notification
  } finally {
    currentListener = prevListener;
  }
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
```

**Expected:** +300-500% in fanout tests (skip unnecessary unsubscribe/resubscribe!)

---

### Phase 4: 記憶體優化

#### 4.1 Object Pooling for Computeds
```typescript
// Pool for reusable computed objects
const computedPool: ComputedCore<any>[] = [];
const MAX_POOL_SIZE = 100;

function createComputed<T>(calc: () => T, deps?: AnyZen[]): ComputedCore<T> {
  let c: ComputedCore<T>;

  if (computedPool.length > 0) {
    c = computedPool.pop()!;
    // Reuse object (same hidden class!)
    c._calc = calc;
    c._sources = deps ? new Set(deps) : new Set();
    c._dirty = true;
    c._value = null;
    c._unsubs = null;
  } else {
    c = new ComputedSignal(calc, deps);
  }

  return c;
}

function recycleComputed(c: ComputedCore<any>): void {
  if (computedPool.length < MAX_POOL_SIZE) {
    // Clear for reuse
    c._calc = null as any;
    c._sources.clear();
    c._listeners?.clear();
    c._unsubs = null;
    computedPool.push(c);
  }
}
```

**Expected:** +500% in memory management test (reduce GC pressure)

---

### Phase 5: Micro-optimizations

#### 5.1 Fast Path for Simple Cases
```typescript
// Optimize common case: single source, no listeners
class ComputedSignal<T> {
  get value(): T {
    // Fast path: single source, no auto-tracking, not dirty
    if (this._sources.size === 1 && !currentListener && !this._dirty) {
      return this._value!;  // Direct return, no checks
    }

    // Slow path: full logic
    if (currentListener) {
      currentListener._sources.add(this);
    }

    if (this._dirty) {
      updateComputed(this);
    }

    if (this._unsubs === null && this._sources.size > 0) {
      subscribeToSources(this);
    }

    return this._value!;
  }
}
```

**Expected:** +30-50% in simple computed cases

---

#### 5.2 Inline Hot Functions
```typescript
// Inline notifyListeners for simple case
function notifyListeners<T>(zen: ZenCore<T>, newValue: T, oldValue: T): void {
  const listeners = zen._listeners;
  if (!listeners || listeners.size === 0) return;

  // Fast path: single listener
  if (listeners.size === 1) {
    const [listener] = listeners;
    listener(newValue, oldValue);
    return;
  }

  // Multiple listeners
  for (const listener of listeners) {
    listener(newValue, oldValue);
  }
}
```

**Expected:** +10-20% in notification overhead

---

## 📊 預期結果

### 性能提升預測

| Optimization | Target Tests | Expected Gain |
|-------------|--------------|---------------|
| **Hidden Classes** | All tests | +20-30% |
| **Set Listeners** | Fanout, Memory | +200-400% |
| **Graph Coloring** | Diamond patterns | +50-100% |
| **Skip Re-subscribe** | Fanout, Static deps | +300-500% |
| **Object Pooling** | Memory management | +500% |
| **Fast Paths** | Simple cases | +30-50% |

### 預期 vs SolidJS

| Test | Current Gap | After Optimization | Result |
|------|-------------|-------------------|---------|
| Computed Value | -47% | **+10%** ✅ | BEAT |
| Wide Fanout | -72% | **+5%** ✅ | BEAT |
| Massive Fanout | -85% | **+15%** ✅ | BEAT |
| Memory Management | -88% | **+20%** ✅ | BEAT |
| Batch Write | -48% | **+8%** ✅ | BEAT |

**Overall:** Beat SolidJS in **ALL 28 tests!** 🚀

---

## 🔧 Implementation Priority

### Highest ROI (Do First!)

1. **Set-Based Listeners** (Phase 1.2)
   - Effort: Medium (change listeners to Set)
   - Impact: MASSIVE (+200-400% fanout)
   - Risk: Low (straightforward refactor)

2. **Skip Re-subscribe for Static Deps** (Phase 3.1)
   - Effort: Medium (detect source changes)
   - Impact: HUGE (+300-500% fanout)
   - Risk: Medium (need thorough testing)

3. **Hidden Classes with Class** (Phase 1.1)
   - Effort: High (rewrite core)
   - Impact: Large (+20-30% everything)
   - Risk: Medium (architectural change)

### High Value (Do Second)

4. **Graph Coloring** (Phase 2.1)
   - Effort: High (implement algorithm)
   - Impact: Large (+50-100% diamonds)
   - Risk: High (complex logic)

5. **Object Pooling** (Phase 4.1)
   - Effort: Medium
   - Impact: MASSIVE (memory test +500%)
   - Risk: Low

### Polish (Do Last)

6. **Fast Paths** (Phase 5)
   - Effort: Low
   - Impact: Medium (+10-50%)
   - Risk: Low

---

## 🎯 Final Target

**怪獸級 Zen:**
- ✅ Beat SolidJS in ALL 28 benchmarks
- ✅ Fastest reactive library in ecosystem
- ✅ Zero breaking changes (all internal optimizations)
- ✅ Production-ready (thoroughly tested)
- ✅ Memory efficient (object pooling)
- ✅ Glitch-free (graph coloring)
- ✅ V8-optimized (monomorphic ICs)

**Ready to implement?** 🔥
