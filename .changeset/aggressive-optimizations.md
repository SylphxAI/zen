---
'@sylphx/zen': patch
---

perf: aggressive performance optimizations (4 phases)

**Phase 1: Context Variable Reduction**
- Reduced context save/restore from 4 to 2 variables in update()
- Moved tracking state from global to instance variables
- Implements Solid.js incremental source tracking pattern

**Phase 2: Direct State Comparisons**
- Replaced bitwise flag operations with direct state comparisons
- Separated _pending flag from state bitfield
- Cleaner, more readable state management

**Phase 3: Standalone Functions**
- Extracted hot paths to standalone functions for better V8 inlining
- Created updateIfNecessary(), runUpdate(), notifyObservers(), notifyComputation()
- Class methods delegate to standalone functions

**Phase 4: Signal Notification Optimization**
- Signal.set value() calls standalone functions directly
- Optimized all three notification paths (single, moderate, massive fanout)
- Better type casting and function call overhead reduction

**Bundle Size Impact**: 5.09KB → 4.86KB (4.5% smaller)

**Expected Performance Impact**: 30-48% combined improvement in reactive system performance
