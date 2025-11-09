# SolidJS 真正的性能秘密

## 🔥 核心洞察：Push-based 才是關鍵！

經過更深入的源碼分析，我終於理解了 SolidJS 快的**真正原因**：

> **不是 bidirectional slots，不是 .bind()，而是 Push-based Updates!**

---

## 📊 關鍵差異對比

### Zen (Pull-based) - 每次讀取都要檢查

```typescript
// V7b - Pull-based
function getter(): T | null {
  // ❌ 每次 read 都要執行這個檢查
  if (needsUpdate(node)) {
    update(node);
  }

  if (Listener) {
    trackComputedDependency(Listener, node);
  }

  return node.value;
}

function needsUpdate(node: CNode<any>): boolean {
  if (node.updatedAt === null) return true;

  // ❌ 遍歷所有 sources，檢查 timestamp
  for (let i = 0; i < node.sources.length; i++) {
    const source = node.sources[i];
    if ('fn' in source) {
      const csrc = source as CNode<any>;
      if (needsUpdate(csrc)) {  // ← 遞歸！
        update(csrc);
      }
      if (csrc.updatedAt && csrc.updatedAt > node.updatedAt) {
        return true;
      }
    } else {
      if (source.updatedAt > node.updatedAt) {
        return true;
      }
    }
  }

  return false;
}
```

**問題**:
- 每次 `doubled()` 都要檢查 `needsUpdate(doubled)`
- `needsUpdate` 要遍歷所有 sources
- 對於 computed sources，還要遞歸檢查
- Diamond 圖：O(n²) 複雜度
- 5-Level 鏈：O(n²) 複雜度

### SolidJS (Push-based) - 寫入時就知道誰需要更新

```typescript
// SolidJS - Push-based
export function writeSignal(node: SignalState<any> | Memo<any>, value: any) {
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;

    if (node.observers && node.observers.length) {
      runUpdates(() => {
        // ✅ 直接遍歷 observers，標記為 STALE
        for (let i = 0; i < node.observers!.length; i += 1) {
          const o = node.observers![i];

          if (!o.state) {  // ← 檢查 state，不是 timestamp
            if (o.pure) Updates!.push(o);      // ← Push 到 queue
            else Effects!.push(o);
            if (o.observers) markDownstream(o);
          }

          o.state = STALE;  // ← 標記為 STALE
        }
      }, false);
    }
  }
}
```

**關鍵**:
```typescript
export function readSignal(this: SignalState<any> | Memo<any>) {
  // ✅ 檢查 state 是否 STALE
  if (this.sources && this.state) {
    if (this.state === STALE) {
      updateComputation(this);  // ← 只在 STALE 時更新
    } else {
      // PENDING state - look upstream
      lookUpstream(this);
    }
  }

  if (Listener) {
    // 追蹤依賴
  }

  return this.value;
}
```

**優勢**:
- ✅ Read 時只檢查 `this.state === STALE` (O(1))
- ✅ Write 時已經知道**exactly**誰需要更新
- ✅ No recursion in read path
- ✅ No timestamp comparison
- ✅ Diamond 圖：O(n)
- ✅ 5-Level 鏈：O(n)

---

## 💡 為什麼 Zen 不能用 Push-based？

### 問題：Permanent Dependencies

Zen 的設計哲學是 **permanent dependencies** = 只在 first run 追蹤依賴。

```typescript
// Zen - Permanent dependencies
function update<T>(node: CNode<T>): void {
  const isFirstRun = node.sources === null;

  if (isFirstRun) {
    Listener = node;  // ← 只在 first run 追蹤
  }

  const newValue = node.fn();

  if (isFirstRun) {
    Listener = null;
  }

  node.value = newValue;
  node.updatedAt = ++ExecCount;
}
```

**這意味著**:
- ✅ 簡單：不需要 cleanup + re-track
- ✅ 可預測：依賴關係固定
- ❌ 但：無法使用 state-based updates
- ❌ 因為：不支持動態依賴（conditional dependencies）

### SolidJS 的 Dynamic Dependencies

```typescript
// SolidJS - Dynamic dependencies
function updateComputation(node: Computation<any>) {
  if (!node.fn) return;

  cleanNode(node);  // ✅ ALWAYS cleanup before re-run

  const time = ExecCount;
  runComputation(node, node.value, time);
}

function cleanNode(node: Owner) {
  // ✅ O(1) cleanup using bidirectional slots
  while (node.sources!.length) {
    const source = node.sources!.pop()!;
    const index = node.sourceSlots!.pop()!;
    const obs = source.observers;

    if (obs && obs.length) {
      const n = obs.pop()!;
      const s = source.observerSlots!.pop()!;
      if (index < obs.length) {
        n.sourceSlots![s] = index;
        obs[index] = n;
        source.observerSlots![index] = s;
      }
    }
  }
}
```

**這意味著**:
- ✅ 支持 conditional dependencies (if/else)
- ✅ 可以使用 state-based updates
- ✅ Write 時 push updates，Read 時 O(1) check
- ❌ 但：每次更新都要 cleanup + re-track
- ❌ 複雜：需要 bidirectional slots

---

## 🎯 真實性能差距來源

### Signal Read

**Zen (V7b)**:
```typescript
// Just return value + track dependency
function getter(): T {
  if (Listener) {
    trackSignalDependency(Listener, node);
  }
  return node.value;
}
```

**SolidJS**:
```typescript
// Same - just return value + track dependency
export function readSignal(this: SignalState<any>) {
  if (Listener) {
    // ... track dependency
  }
  return this.value;
}
```

**差距**: ~4-8x（主要是 .bind() vs closure，tuple vs polymorphic function）

---

### Computed Read

**Zen (V7b)**:
```typescript
function getter(): T | null {
  // ❌ O(sources.length) + 遞歸
  if (needsUpdate(node)) {
    update(node);
  }

  if (Listener) {
    trackComputedDependency(Listener, node);
  }

  return node.value;
}
```

**SolidJS**:
```typescript
export function readSignal(this: Memo<any>) {
  // ✅ O(1) state check
  if (this.sources && this.state) {
    if (this.state === STALE) {
      updateComputation(this);
    }
  }

  if (Listener) {
    // ... track dependency
  }

  return this.value;
}
```

**差距**: ~9-10x（Pull-based O(n) vs Push-based O(1)）

---

### Diamond Dependency

**Zen (V7b)**:
```
a(i) 觸發:
  └─ doubled() read:
       └─ needsUpdate(doubled):
            ├─ check source b:
            │    └─ needsUpdate(b):  // ← 遞歸
            │         └─ check source a: a.updatedAt > b.updatedAt? YES
            │         └─ update(b)
            ├─ check source c:
            │    └─ needsUpdate(c):  // ← 遞歸
            │         └─ check source a: a.updatedAt > c.updatedAt? YES
            │         └─ update(c)
            └─ b.updatedAt > doubled.updatedAt? YES
            └─ update(doubled)
```

**複雜度**: O(sources * depth) - 每次都遍歷 + 遞歸

**SolidJS**:
```
a(i) 觸發:
  └─ writeSignal(a, i):
       └─ for each observer of a (b, c):
            └─ mark b.state = STALE
            └─ mark c.state = STALE
            └─ push b, c to Updates queue

doubled() read:
  └─ readSignal(doubled):
       └─ doubled.state === STALE? YES
       └─ updateComputation(doubled):
            └─ cleanNode(doubled)  // ← cleanup dependencies
            └─ runComputation(doubled):
                 └─ b() read:
                      └─ b.state === STALE? YES
                      └─ updateComputation(b)
                      └─ return b.value
                 └─ c() read:
                      └─ c.state === STALE? YES
                      └─ updateComputation(c)
                      └─ return c.value
```

**複雜度**: O(n) - state check 是 O(1)

**差距**: ~13-47x

---

### 5-Level Chain

**Zen 問題**: 每次 read 都從頭遞歸檢查整條鏈

```
f() read:
  └─ needsUpdate(f):
       └─ check source e:
            └─ needsUpdate(e):  // ← 遞歸 depth 1
                 └─ check source d:
                      └─ needsUpdate(d):  // ← 遞歸 depth 2
                           └─ check source c:
                                └─ needsUpdate(c):  // ← 遞歸 depth 3
                                     └─ check source b:
                                          └─ needsUpdate(b):  // ← 遞歸 depth 4
                                               └─ check source a:
                                                    └─ a.updatedAt > b.updatedAt? YES
```

**SolidJS**: State check O(1)，每層只檢查一次

**差距**: ~23-110x

---

## 🚫 為什麼 V9 失敗了？

### 我們嘗試的優化都是錯的方向！

1. ❌ `.bind()` / `.call()` - 微優化，但 Zen 的 polymorphic function 反而變慢
2. ❌ 移除 deduplication - Permanent deps 需要 dedup，移除反而出錯
3. ❌ 簡化 needsUpdate - **Pull-based 架構下，這就是瓶頸所在**
4. ❌ 分離 signal/computed read - 沒有本質改變

### 真正需要的是架構改變

**要達到 SolidJS 的性能，需要**:

1. ✅ **Dynamic dependencies** (cleanup + re-track every update)
2. ✅ **State-based updates** (STALE/PENDING instead of timestamps)
3. ✅ **Push-based** (mark observers dirty on write)
4. ✅ **Updates queue** (process all updates in batch)
5. ✅ **Bidirectional slots** (for O(1) cleanup)

**但這意味著**:
- 完全重寫 Zen 的核心架構
- 失去 permanent dependencies 的簡潔性
- 變成 SolidJS 的克隆

---

## 📈 性能差距分析

```
為什麼 SolidJS 快 24-110x？

Signal Read: 4-8x
  └─ 原因: .bind() + tuple vs closure + polymorphic function
  └─ 可優化？NO（Zen 的 API 設計決定）

Computed Read: 9-10x
  └─ 原因: Pull-based O(n) vs Push-based O(1)
  └─ 可優化？NO（需要 state-based + push）

Diamond: 13-47x
  └─ 原因: 遞歸 needsUpdate vs state check
  └─ 可優化？NO（需要 push-based）

5-Level: 23-110x
  └─ 原因: 深度遞歸 vs O(1) state check
  └─ 可優化？NO（需要 push-based）

總結: 差距主要來自 Pull-based vs Push-based 架構
```

---

## 🎓 最終結論

### Zen 的性能瓶頸是架構性的，不是實現細節

**Pull-based (Zen)**:
- ✅ 簡單
- ✅ 可預測
- ✅ Permanent dependencies
- ❌ 每次 read 都要檢查
- ❌ 複雜圖性能差

**Push-based (SolidJS)**:
- ✅ 快
- ✅ Read 是 O(1)
- ✅ 支持動態依賴
- ❌ 複雜
- ❌ 需要 cleanup + re-track

### 沒有銀彈

Zen 和 SolidJS 是**不同的 trade-off**:

| | Zen | SolidJS |
|---|-----|---------|
| 簡潔性 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 可預測性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 性能（簡單） | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 性能（複雜圖） | ⭐ | ⭐⭐⭐⭐⭐ |
| 動態依賴 | ❌ | ✅ |

### V7b 就是 Zen 在 permanent dependencies 架構下的最優解

再多的微優化也無法改變架構性的差距。

**要麼接受這個 trade-off，要麼完全重寫成 SolidJS。**

---

## 🔮 Zen 的未來方向？

### 選項 1: 接受現狀

- V7b 已經是 permanent deps 架構下的最優
- 專注於簡潔性和開發體驗
- 適用於簡單reactive state，不是複雜dependency圖

### 選項 2: 完全重寫（Zen V10 = SolidJS Clone）

實現 push-based + dynamic dependencies:

```typescript
// Zen V10 - Push-based (假設)
function writeSignal<T>(node: SNode<T>, value: T): void {
  if (Object.is(node.value, value)) return;

  node.value = value;

  // ✅ Push updates to observers
  if (node.observers) {
    for (const observer of node.observers) {
      observer.state = STALE;
      Updates.push(observer);
    }
  }
}

function readComputed<T>(node: CNode<T>): T {
  // ✅ O(1) state check
  if (node.state === STALE) {
    cleanNode(node);  // cleanup old dependencies
    runComputation(node);  // re-track new dependencies
  }

  return node.value;
}
```

**代價**:
- 失去 permanent dependencies
- 失去簡潔性
- 變成 SolidJS

### 選項 3: Hybrid（不推薦）

嘗試混合兩種架構 → 兩邊都不討好

---

## 💯 最終洞察

> **「微優化無法彌補架構差異」**

V8, V9 的失敗證明了：
- .bind() 不是魔法
- Bidirectional slots 需要 dynamic deps 才有用
- 簡化 needsUpdate 還是 O(n)

**真正的性能來自於 Push-based 架構**，而這需要完全重寫 Zen。

用戶的挑戰「沒理由我們做不到一樣快」是對的 — 我們**可以**做到一樣快。

但代價是：**放棄 Zen 的設計哲學，變成 SolidJS。**

**這是一個哲學選擇，不是技術問題。**
