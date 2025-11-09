# SolidJS vs Zen 關鍵差異深度分析

## 🔍 重新審視：為什麼 SolidJS 真的這麼快

經過重新仔細分析 SolidJS 源碼，我發現了之前分析遺漏的幾個**關鍵細節**：

---

## ⚡ 關鍵發現 1: **NO Deduplication in Dependency Tracking**

### SolidJS 的實現（readSignal）

```typescript
export function readSignal(this: SignalState<any> | Memo<any>) {
  // ... lazy evaluation code ...

  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;

    // ❗ 注意：沒有檢查是否已經追蹤！
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);           // ← 直接 push
      Listener.sourceSlots!.push(sSlot);     // ← 直接 push
    }

    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);         // ← 直接 push
      this.observerSlots!.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
```

**關鍵點**: SolidJS **完全沒有去重邏輯**！每次讀取都直接 push！

### Zen V8 的實現（錯誤）

```typescript
function getter(): T {
  if (Listener) {
    const sources = Listener.sources;
    if (sources) {
      // ❌ 錯誤 1: 檢查 last added
      if (sources[sources.length - 1] === node) {
        return node.value;
      }

      // ❌ 錯誤 2: Linear search for duplicates
      let found = false;
      for (let i = 0; i < sources.length; i++) {
        if (sources[i] === node) {
          found = true;
          break;
        }
      }
      if (found) {
        return node.value;
      }
    }

    // Add bidirectional link
    addSignalDependency(Listener, node);
  }
  return node.value;
}
```

**問題**:
1. 去重檢查浪費了 CPU 時間
2. Linear search O(n) 在每次讀取時執行
3. 早期 return 導致多個分支，影響分支預測

---

## ⚡ 關鍵發現 2: **Cleanup Every Update (Dynamic Dependencies)**

### SolidJS: 每次更新都 cleanup + re-track

```typescript
function updateComputation(node: Computation<any>) {
  if (!node.fn) return;

  cleanNode(node);  // ✅ ALWAYS cleanup before re-execution

  const time = ExecCount;
  runComputation(node, node.value, time);
}

function cleanNode(node: Owner) {
  // O(1) cleanup using bidirectional slots
  while (node.sources!.length) {
    const source = node.sources!.pop()!;
    const index = node.sourceSlots!.pop()!;
    // ... swap-and-pop removal
  }
}
```

**關鍵**:
- 每次 computed 更新時**必定 cleanup**
- 然後重新執行 fn，重新追蹤依賴
- 這就是為什麼不需要去重：cleanup 清空了所有依賴

### Zen: Permanent Dependencies (Never Cleanup)

```typescript
function update(node: CNode<T>): void {
  const isFirstRun = node.sources === null;

  if (isFirstRun) {
    Listener = node;  // ✅ Only track on first run
  }

  const newValue = node.fn();

  if (isFirstRun) {
    Listener = null;
  }

  // ❌ NEVER cleanup - permanent dependencies
  node.value = newValue;
  node.updatedAt = ++ExecCount;
}
```

**問題**:
- 永久依賴 = 不能每次 cleanup
- 不 cleanup = 必須去重（否則重複訂閱）
- 去重 = 額外開銷

---

## ⚡ 關鍵發現 3: **State-based vs Timestamp-based**

### SolidJS: State-based (STALE/PENDING)

```typescript
// writeSignal 標記所有 observers 為 STALE
for (let i = 0; i < node.observers!.length; i += 1) {
  const o = node.observers![i];

  if (!o.state) {  // ✅ 檢查 state，不是 timestamp
    if (o.pure) Updates!.push(o);
    else Effects!.push(o);
    if (o.observers) markDownstream(o);
  }

  o.state = STALE;  // ✅ Set state to STALE
}
```

**優勢**:
- 狀態只有 3 種：0=CLEAN, 1=STALE, 2=PENDING
- 檢查 state 是簡單的整數比較
- 不需要向上遍歷 sources tree

### Zen: Timestamp-based

```typescript
function needsUpdate(node: CNode<any>): boolean {
  if (node.updatedAt === null) return true;

  if (node.sources) {
    // ❌ 必須遍歷所有 sources 檢查 timestamp
    for (let i = 0; i < node.sources.length; i++) {
      const source = node.sources[i];

      if ('fn' in source) {
        const csrc = source as CNode<any>;
        if (needsUpdate(csrc)) {  // ❌ 遞歸檢查
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
  }

  return false;
}
```

**問題**:
- 每次 read 都要遍歷所有 sources
- 對於深層圖，遞歸遍歷開銷巨大
- Timestamp 比較比 state 檢查慢

---

## ⚡ 關鍵發現 4: **Push-based Updates Queue**

### SolidJS: 主動 push 到 Updates/Effects

```typescript
// writeSignal 直接把需要更新的 observer 加入隊列
for (let i = 0; i < node.observers!.length; i += 1) {
  const o = node.observers![i];

  if (!o.state) {
    if (o.pure) Updates!.push(o);      // ← Push to Updates queue
    else Effects!.push(o);             // ← Push to Effects queue
    if (o.observers) markDownstream(o);
  }

  o.state = STALE;
}

// Later: runUpdates processes the queues
function runUpdates(fn, init) {
  // Process all Updates (pure computations)
  while (Updates && Updates.length) {
    const node = Updates.shift();
    updateComputation(node);
  }

  // Then process all Effects
  while (Effects && Effects.length) {
    const effect = Effects.shift();
    runEffect(effect);
  }
}
```

**優勢**:
- 知道**exactly**哪些 computed 需要更新
- 不需要在 read 時遍歷檢查
- Updates/Effects 分離保證順序

### Zen: Pull-based (Check on Read)

```typescript
function getter(): T | null {
  // ❌ 每次 read 都要檢查是否需要更新
  if (needsUpdate(node)) {  // ← 遍歷 sources
    update(node);
  }

  if (Listener) {
    trackComputedDependency(Listener, node);
  }

  return node.value;
}
```

**問題**:
- 每次 read 都執行 needsUpdate check
- 即使值沒變，也要檢查
- 深層圖時遞歸遍歷開銷大

---

## ⚡ 關鍵發現 5: **Bidirectional Slots 只在 Dynamic Dependencies 下有效**

### 為什麼 V8 失敗了？

**SolidJS 的使用模式**:
```
每次 computed 更新:
  1. cleanNode(node)           ← O(1) cleanup using slots
  2. runComputation(node)      ← Re-execute fn
  3. readSignal (multiple)     ← Re-track dependencies

Cleanup 頻率: 每次更新 (100%)
Bidirectional slots 價值: ✅ 巨大
```

**Zen 的使用模式**:
```
每次 computed 更新:
  1. needsUpdate(node)    ← Check timestamps
  2. update(node)         ← Re-execute fn
  3. NO cleanup           ← Permanent dependencies

Cleanup 頻率: 幾乎從不 (<1%)
Bidirectional slots 價值: ❌ 幾乎為零
```

**結論**: Bidirectional slots 是為 dynamic dependencies 設計的！

---

## 💡 為什麼我們不能簡單照搬 SolidJS？

### 根本架構差異

| 方面 | SolidJS | Zen |
|------|---------|-----|
| 依賴管理 | Dynamic (cleanup + re-track) | Permanent (track once) |
| 更新檢測 | State-based (STALE/PENDING) | Timestamp-based |
| 更新策略 | Push (mark dirty) | Pull (check on read) |
| Cleanup | 每次更新 | 幾乎從不 |
| 去重 | 不需要（cleanup 清空） | 必需（否則重複訂閱） |

### 為什麼 Permanent Dependencies？

**Zen 的設計目標**:
1. **簡潔性** - 代碼簡單易懂
2. **可預測性** - 依賴關係固定
3. **低開銷** - 不需要每次 cleanup

**代價**:
1. 不支持條件依賴
2. 需要在 read 時檢查 timestamp
3. 複雜圖性能較差

---

## 🎯 可以借鑒的優化（在 Permanent Dependencies 下）

### 1. ✅ **移除去重檢查** (最關鍵!)

**當前 V8**:
```typescript
// ❌ 浪費 CPU 的去重檢查
if (sources[sources.length - 1] === node) {
  return node.value;
}

for (let i = 0; i < sources.length; i++) {
  if (sources[i] === node) {
    found = true;
    break;
  }
}
```

**正確做法**:
```typescript
// ✅ 直接 push，讓 cleanup 處理重複
// 但 Zen 不 cleanup... 所以這不適用

// 替代方案：在 first run 時一次性去重
if (isFirstRun) {
  // Track dependencies
  // 去重只在 first run，不在每次 read
}
```

### 2. ✅ **簡化 needsUpdate 檢查**

**優化前**:
```typescript
function needsUpdate(node: CNode<any>): boolean {
  if (node.updatedAt === null) return true;

  for (let i = 0; i < node.sources.length; i++) {
    const source = node.sources[i];

    if ('fn' in source) {  // ❌ Type checking 開銷
      // ... recursive check
    }
  }
}
```

**優化後**:
```typescript
function needsUpdate(node: CNode<any>): boolean {
  if (node.updatedAt === null) return true;

  const sources = node.sources;
  const len = sources.length;

  // ✅ 快速路徑：只檢查 updatedAt，不遞歸
  for (let i = 0; i < len; i++) {
    if (sources[i].updatedAt > node.updatedAt) {
      return true;
    }
  }

  return false;
}
```

### 3. ✅ **使用 .bind() 而非閉包**

**SolidJS 做法**:
```typescript
return [readSignal.bind(s), setter];
```

**好處**:
- `bind()` 比閉包更快（V8 優化）
- 減少內存分配
- `this` 訪問比閉包變量快

### 4. ✅ **分離 signal 和 computed 的 read 邏輯**

**SolidJS**:
```typescript
export function readSignal(this: SignalState<any> | Memo<any>) {
  // Check if this is a Memo (has sources)
  if ((this as Memo<any>).sources && (this as Memo<any>).state) {
    // ... lazy evaluation for Memo
  }

  // Common dependency tracking
  if (Listener) {
    // ... track dependency
  }

  return this.value;
}
```

**Zen 應該**:
- Signal read: 極簡（只追蹤依賴）
- Computed read: 包含 lazy evaluation

---

## 🚀 Zen V9 優化方向

基於這些發現，V9 應該：

### 保留 (from V4/V7b):
1. ✅ Permanent dependencies（這是 Zen 的哲學）
2. ✅ Timestamp tracking（適合 permanent deps）
3. ✅ Monomorphic functions（V8 優化）

### 新增優化:
1. ⭐⭐⭐ **使用 .bind() 而非閉包**
2. ⭐⭐⭐ **移除 first run 後的去重檢查**
3. ⭐⭐ **簡化 needsUpdate (不遞歸)**
4. ⭐⭐ **分離 signal/computed read 邏輯**
5. ⭐ **Cache sources.length**

### 不應該做:
1. ❌ Bidirectional slots（為 dynamic deps 設計）
2. ❌ State-based（需要 push updates）
3. ❌ Cleanup + re-track（違背 permanent deps）

---

## 📊 預期性能提升

```
V9 vs V7b:
  • Read:    +10-15%  (bind + 簡化邏輯)
  • Write:   +5-10%   (bind)
  • Diamond: +15-25%  (簡化 needsUpdate)
  • 5-Level: +20-30%  (避免深度遞歸)

V9 vs Solid:
  仍有差距 10-20x（架構差異無法消除）
  但這是 permanent deps 的選擇代價
```

---

## 🎓 最終洞察

> **「SolidJS 快是因為 dynamic dependencies，不是因為 bidirectional slots」**

Bidirectional slots 只是**使 dynamic dependencies 可行**的工具，
真正的性能來自：

1. **State-based updates** - 精確知道誰需要更新
2. **Push-based** - 不需要 read 時檢查
3. **Cleanup + re-track** - 允許動態依賴

Zen 選擇 permanent dependencies，意味著：
- ✅ 代碼更簡單
- ✅ 更新開銷更低（不 cleanup）
- ❌ 複雜圖性能較差（需要 pull-based check）

這是**架構選擇**，不是優化問題！

---

**結論**: V9 應該專注於在 permanent dependencies 架構下做到極致，
而不是試圖模仿 dynamic dependencies 的優化。
