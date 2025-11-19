# Monorepo Dependencies Guide

## Quick Decision Tree

```
Is this package published to npm?
├─ NO → use `workspace:*` in dependencies
└─ YES → Continue ↓

Does user need to install this separately? (React, Vue, @zen/signal)
├─ YES → peerDependencies
└─ NO → Continue ↓

Only needed during development/testing?
├─ YES → devDependencies
└─ NO → dependencies
```

---

## Rules by Package Type

### 1. Framework Integration Packages
**Examples:** @zen/signal-zen (adapter for Zen framework)

```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*",
    "typescript": "^5.8.3",
    "bunup": "^0.15.13"
  }
}
```

**WHY:**
- @zen/signal MUST be peerDependency (prevents duplicate state managers)
- Use `workspace:*` in devDependencies for local development
- Use specific version in devDependencies for testing

**TRADE-OFF:**
- ✅ No duplicate @zen/signal instances
- ✅ Smaller bundle sizes
- ✅ No version conflicts
- ❌ Users must install both packages

---

### 2. Pattern/Helper Libraries
**Examples:** @zen/signal-patterns, @zen/router

```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*",
    "typescript": "^5.8.3",
    "bunup": "^0.15.13"
  }
}
```

**WHY:**
- @zen/signal is peerDependency (avoid bundling, let user control version)
- `workspace:*` for local development

---

### 3. Packages Depending on Other Internal Packages
**Examples:** @zen/signal-persistent, @zen/router-react

```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0",
    "@zen/signal-patterns": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*",
    "@zen/signal-patterns": "workspace:*",
    "typescript": "^5.8.3",
    "bunup": "^0.15.13"
  }
}
```

**WHY:**
- Both packages are peers (transitivity: if patterns is peer, this package should also treat it as peer)
- Ensures single instance across entire dependency tree

---

### 4. Standalone Utility Packages
**Example:** @zen/signal-craft (immutable updates)

```json
{
  "dependencies": {
    "immer": "^10.0.0"
  },
  "peerDependencies": {
    "@zen/signal": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*",
    "typescript": "^5.8.3",
    "bunup": "^0.15.13"
  }
}
```

**WHY:**
- Implementation details bundled (user doesn't need to know)
- @zen/signal is peer (avoid duplicate state manager)

---

### 5. Core Package
**Example:** @zen/signal (no runtime dependencies)

```json
{
  "devDependencies": {
    "typescript": "^5.8.3",
    "bunup": "^0.15.13",
    "solid-js": "^1.9.10"
  }
}
```

**WHY:**
- Zero runtime dependencies (performance, security)
- Build tools only in devDependencies
- solid-js for benchmarking only

---

## Version Range Guidelines

### peerDependencies - Use WIDE ranges

```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0",           // ✅ Accept any 0.x (pre-release)
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"  // ✅ Support multiple majors
  }
}
```

**WHY:**
- Prevents cascading major version bumps
- Gives users flexibility
- Reduces ecosystem fragmentation

**Note:** Using `^0.0.0` during development. Will change to `^1.0.0` after first stable release.

### devDependencies - Use SPECIFIC or LATEST

```json
{
  "devDependencies": {
    "@zen/signal": "workspace:*",     // ✅ Use local version
    "react": "^19.2.0",               // ✅ Specific version for testing
    "typescript": "^5.8.3"            // ✅ Specific version for consistency
  }
}
```

### dependencies - Use CONSERVATIVE ranges

```json
{
  "dependencies": {
    "immer": "^10.0.0"  // ✅ Accept minor/patch updates
  }
}
```

---

## Common Patterns

### Pattern 1: Framework Adapter
```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0",
    "@zen/zen": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*",
    "@zen/zen": "workspace:*"
  }
}
```
**Used by:** @zen/signal-zen

### Pattern 2: Utility Extension
```json
{
  "peerDependencies": {
    "@zen/signal": "^0.0.0"
  },
  "devDependencies": {
    "@zen/signal": "workspace:*"
  }
}
```
**Used by:** @zen/signal-patterns, @zen/router

### Pattern 3: Router Framework Bindings
```json
{
  "peerDependencies": {
    "@zen/router": "^0.0.0",
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@zen/router": "workspace:*",
    "react": "^19.2.0"
  }
}
```
**Used by:** @zen/router-react, @zen/router-preact

---

## Red Flags

### ❌ Never Do This

```json
{
  "dependencies": {
    "@zen/signal": "workspace:*"  // ❌ Will bundle signal into package
  }
}
```
**Result:** Duplicate signal instances, version conflicts

```json
{
  "peerDependencies": {
    "react": "workspace:*"  // ❌ npm doesn't understand workspace:*
  }
}
```
**Result:** Install failure for end users

```json
{
  "dependencies": {
    "@zen/signal": "^0.0.0"  // ❌ For integration packages
  },
  "peerDependencies": {
    "@zen/signal": "^0.0.0"
  }
}
```
**Result:** Duplicate @zen/signal in node_modules

---

## Summary Table

| Dependency Type | When to Use | Version Format | Published? |
|----------------|-------------|----------------|------------|
| **peerDependencies** | User must install (React, @zen/signal) | `^X.0.0` (wide) | ✅ Yes |
| **dependencies** | Bundle with package (immer, utilities) | `^X.Y.0` (conservative) | ✅ Yes |
| **devDependencies** | Build/test/development only | `^X.Y.Z` or `workspace:*` | ❌ No |
| **workspace:*** | Monorepo local development | N/A | ❌ No |
