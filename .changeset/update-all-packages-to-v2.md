---
"@sylphx/zen-react": major
"@sylphx/zen-preact": major
"@sylphx/zen-solid": major
"@sylphx/zen-svelte": major
"@sylphx/zen-vue": major
"@sylphx/zen-router": major
"@sylphx/zen-router-react": major
"@sylphx/zen-router-preact": major
"@sylphx/zen-craft": major
"@sylphx/zen-persistent": major
---

Update all packages to use zen v2.0.0 API (.value property)

## Breaking Changes

All packages have been updated to use the new zen v2.0.0 API which replaces `get()`/`set()` functions with the `.value` property accessor.

### Migration Guide

**Before (v1.x):**
```typescript
import { zen, get, set } from '@sylphx/zen';

const count = zen(0);
const value = get(count);
set(count, 1);
```

**After (v2.0):**
```typescript
import { zen } from '@sylphx/zen';

const count = zen(0);
const value = count.value;
count.value = 1;
```

### Affected Packages

- **Framework Bindings**: zen-react, zen-preact, zen-solid, zen-svelte, zen-vue
- **Router**: zen-router, zen-router-react, zen-router-preact
- **Utilities**: zen-craft, zen-persistent

All framework bindings and utilities now use `store.value` instead of `get(store)` and `store.value = x` instead of `set(store, x)`.

### Performance Improvements

The new `.value` API provides:
- **73% faster** reads
- **56% faster** writes
- Zero closure overhead through native getters/setters
