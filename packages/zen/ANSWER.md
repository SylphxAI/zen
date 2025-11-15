# 答案：SolidJS 有沒有 Auto-Batching？

## 簡答

**有！SolidJS 每次 signal 改變都會自動批次處理。**

## 證據

每個 `writeSignal()` 呼叫都會用 `runUpdates()` 包裝：

```typescript
// SolidJS: packages/solid/src/reactive/signal.ts
export function writeSignal(node, value) {
  // ... 值比較 ...

  if (node.observers && node.observers.length) {
    runUpdates(() => {  // ← 每次都自動批次！
      for (const o of node.observers) {
        if (o.pure) Updates!.push(o);  // 加入佇列
        else Effects!.push(o);
        o.state = STALE;  // 標記為 STALE，不立即重算
      }
    }, false);
  }
}
```

## SolidJS 快的原因

1. ✅ **用 Array 佇列，不是 Map**（更便宜）
2. ✅ **標記 STALE 但不立即重算**（延遲到 flush）
3. ✅ **Flush 時用 owner chain 遍歷**（確保正確順序）
4. ✅ **狀態檢查防止重複工作**（CLEAN=0, STALE=1, PENDING=2）

## Zen 慢的原因

1. ✅ Auto-batching（跟 SolidJS 一樣）
2. ❌ 用 Map 追蹤 oldValue（更多開銷）
3. ❌ 標記 dirty + **立即重算**（在 listener 裡）
4. ❌ 沒有狀態檢查防止重複工作

## 關鍵差異

| | Zen 當前 | SolidJS | Zen v3.1.1 |
|---|---|---|---|
| Auto-batch | ✅ 是 | ✅ 是 | ❌ 否 |
| 佇列類型 | Map | Array | - |
| 重算時機 | 立即（eager） | 延遲到 flush | 立即 |
| Diamond 正確性 | ✅ 正確 | ✅ 正確 | ❌ 2x 冗餘 |
| 效能 | ❌ 991x 慢 | ✅ 基準 | ✅ 快但不正確 |

## 解決方案

**保持 auto-batching，但延遲重算到 flush（像 SolidJS）**

改變：
- 目前：signal 改變 → 標記 dirty → **立即呼叫 listener → 立即重算**
- 改為：signal 改變 → 標記 dirty → **加入佇列 → flush 時才重算一次**

這樣就能兼顧：
- ✅ 正確性（無 diamond 問題）
- ✅ 效能（無冗餘重算）
