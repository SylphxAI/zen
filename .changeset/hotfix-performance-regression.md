---
"@sylphx/zen": patch
---

## 🚨 CRITICAL HOTFIX: Performance Regression

**Immediate fix for critical performance degradation in v3.1.2**

### Problem
- v3.1.2 accidentally used zen.ts generic implementations instead of optimized computed.ts/effect.ts files
- This caused severe performance regression (52x slower vs SolidJS)
- Third-party benchmarks showed Zen dropping from 1st to 3rd place
- Users experienced significant slowdown in real applications

### Solution
- Restore exports to use dedicated optimized computed.ts and effect.ts
- Keep optimized computed.ts (11KB) and effect.ts (5KB) implementations
- Maintain performance characteristics while keeping reasonable bundle size

### Impact
- ✅ Restores original high performance
- ✅ Fixes cache invalidation issues (1.7M → 5M+ ops/sec)
- ✅ Returns Zen to competitive position vs SolidJS/Preact
- ✅ Bundle size: 1.68 KB gzipped (acceptable trade-off)

### For Users
**Please upgrade immediately**: `npm install @sylphx/zen@latest`

All applications using v3.1.2 should upgrade to restore performance.