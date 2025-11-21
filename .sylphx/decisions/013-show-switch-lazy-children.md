# ADR-013: Fix Show/Switch to Use Lazy Children Properly

**Status:** ✅ Accepted
**Date:** 2024-11-22

---

## Context

Descriptor Pattern (ADR-011) 提供了 lazy getter for children，但 Show/Switch 組件實現錯誤，過早讀取 children。

### 問題

**Show 原本實現**：
```typescript
export function Show(props) {
  const { when, fallback, children } = props;  // ← 解構！

  effect(() => {
    if (condition) {
      return children;  // 已經執行咗
    }
  });
}
```

**問題**：解構會觸發 getter，立即執行 children descriptor！

**測試結果**：
```tsx
<Show when={false}>
  <ExpensiveChild />  // ← 即使 when=false 都會執行！❌
</Show>
```

---

## Decision

**使用 `children()` helper 延遲讀取**：

```typescript
export function Show(props) {
  const c = children(() => props.children);  // ← 延遲！

  effect(() => {
    const condition = resolve(props.when);

    if (condition) {
      const child = c();  // ← 只有 true 時先讀取！
      // render child
    }
    // when=false：唔調用 c()，唔執行 children ✅
  });
}
```

---

## Rationale

### JavaScript Getter Semantics

**普通 property vs Getter**：

```javascript
// ❌ 普通 property：解構唔會執行
const obj = { a: () => console.log('hi') };
const { a } = obj;  // 冇執行

// ✅ Getter property：解構會執行！
const obj = {
  get a() {
    console.log('hi');
    return 'value';
  }
};
const { a } = obj;  // ← 立即打印 'hi'！
```

**Descriptor Pattern 用 Getter**：

```typescript
// makeLazyPropsForDescriptor 創建：
props = {
  get children() {  // ← Getter！
    return executeDescriptor(children);
  }
}

// 解構會觸發：
const { children } = props;  // ← 執行 descriptor！
```

### Why children() Helper Works

```typescript
// children() helper：
export function children(fn: () => T): () => T {
  const memo = computed(fn);  // 創建 computed，唔執行
  return () => memo.value;    // 返回 accessor
}

// 用法：
const c = children(() => props.children);  // ← 唔讀 props.children
// ...
const child = c();  // ← 呢度先讀取！
```

**三個作用**：
1. **延遲讀取**：唔立即觸發 getter
2. **Memoization**：多次調用只執行一次
3. **Reactive Tracking**：Computed 包裝

---

## Implementation

### Show Component

**文件**: `packages/zen-runtime/src/components/Show.ts`

```typescript
export function Show<T>(props: ShowProps<T>): any {
  // IMPORTANT: Don't destructure props.children here!
  // Descriptor pattern provides lazy getter - only read when needed
  const c = children(() => props.children);
  const f = children(() => props.fallback);

  // ... platform ops, marker

  queueMicrotask(() => {
    dispose = effect(() => {
      const condition = resolve(props.when);

      // Cleanup previous
      if (currentNode) {
        // ... cleanup
      }

      // Render appropriate branch
      if (condition) {
        // Only now read props.children (via c())
        currentNode = untrack(() => {
          const child = c();  // ← Lazy read!
          return typeof child === 'function' ? child(condition) : child;
        });
      } else {
        // Only read fallback if condition is false
        const fb = f();
        if (fb) {
          currentNode = untrack(() => {
            return typeof fb === 'function' ? fb() : fb;
          });
        }
      }

      // ... insert into tree
    });
  });

  return marker;
}
```

### Switch Component

**文件**: `packages/zen-runtime/src/components/Switch.ts`

```typescript
export function Switch(props: SwitchProps): any {
  const { fallback, children } = props;

  // ... setup

  const dispose = effect(() => {
    // ... cleanup previous

    // Find first matching branch
    for (const child of children) {
      const matchProps = (child as any)._matchProps;

      if (matchProps) {
        // IMPORTANT: Don't destructure matchProps.children here!
        const { when } = matchProps;
        const c = children(() => matchProps.children);  // ← Lazy!

        const condition = typeof when === 'function' ? when() : when;

        if (condition) {
          // Only now read the matched branch's children
          currentNode = untrack(() => {
            const matchChildren = c();  // ← Lazy read!
            return typeof matchChildren === 'function'
              ? matchChildren(condition)
              : matchChildren;
          });
          break;
        }
      }
    }

    // ... fallback, insert
  });

  return marker;
}
```

---

## Testing

**Test**: `examples/tui-demo/src/show-lazy-test.tsx`

```tsx
let expensiveChildExecuted = false;

const ExpensiveChild = () => {
  expensiveChildExecuted = true;
  return <Text>Expensive</Text>;
};

// Test 1: when=false
<Show when={() => false}>
  <ExpensiveChild />
</Show>

// Result: ✅ expensiveChildExecuted = false
// ExpensiveChild did NOT execute!

// Test 2: when=true
<Show when={() => true}>
  <CheapChild />
</Show>

// Result: ✅ CheapChild executed
```

---

## Consequences

### Positive

1. **真正 Lazy Execution** - children 只在需要時執行
2. **性能優化** - when=false 時完全避免執行
3. **配合 Descriptor Pattern** - 完美利用 lazy getter
4. **Memoization** - children() helper 避免重複執行
5. **Runtime-First** - 無需 compiler

### Negative

1. **API 限制** - Show/Switch 實現必須用 children() helper，不能解構 props
2. **內部複雜度** - 框架作者需要理解 getter semantics

### Trade-offs

**放棄**: 簡單的 `const { children } = props` 解構
**獲得**:
- 真正的條件執行（performance）
- 完美配合 descriptor pattern
- 無需 compiler（runtime-first）

---

## Alternatives Considered

### Alternative 1: Compiler Auto-wrap

Compiler 自動將 `<Show><Child /></Show>` 轉換為 `<Show>{() => <Child />}</Show>`

**Rejected**: 違反 Runtime-First 原則

### Alternative 2: 保留解構，用普通 property

讓 descriptor pattern 返回普通 property 而非 getter：
```typescript
props = {
  children: descriptor  // 普通 property
}
```

**Rejected**:
- 失去延遲執行能力
- Context propagation 會失效
- 違背 descriptor pattern 設計

### Alternative 3: Proxy-based Lazy Props

用 Proxy 攔截屬性訪問

**Rejected**:
- 性能開銷
- 複雜度高
- 難以調試

---

## References

- Related: ADR-011 (Descriptor Pattern)
- Related: ADR-012 (Context Provider Lazy Children)
- Implementation: `packages/zen-runtime/src/components/Show.ts`
- Implementation: `packages/zen-runtime/src/components/Switch.ts`
- Test: `examples/tui-demo/src/show-lazy-test.tsx`

---

## Key Insight

**Descriptor Pattern + children() helper = 完美解決所有 lazy children 問題**

- ✅ Context ordering (ADR-011)
- ✅ Conditional execution (ADR-013)
- ✅ Performance optimization
- ✅ Runtime-first (無需 compiler)
