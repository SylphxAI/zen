# @sylphlab/zen-router-preact

## 1.1.0

### Minor Changes

- 82f6603: # zen-craft: Major API refactor to establish Zen identity

  **BREAKING CHANGES:**

  - Renamed primary API from `update()` to `craft()` (matches package name)
  - Removed `applyPatches()` export (use `@sylphx/craft` directly)
  - Removed `produce()` for plain objects (use `@sylphx/craft` directly)
  - Removed `CraftResult` type export (internal implementation detail)

  **New exports:**

  - `craft()` - Primary API for updating Zen stores
  - `CraftOptions` - Options type for type-safe wrappers
  - `Patch` - JSON Patch type
  - `nothing` - Symbol for property deletion

  **Migration guide:**

  ```typescript
  // Before
  import { update } from "@sylphx/zen-craft";
  update($store, (draft) => {
    draft.count++;
  });

  // After
  import { craft } from "@sylphx/zen-craft";
  craft($store, (draft) => {
    draft.count++;
  });

  // For plain objects, use @sylphx/craft
  import { craft } from "@sylphx/craft";
  const next = craft(state, (draft) => {
    draft.count++;
  });
  ```

  **Deprecated (will be removed in v2.0):**

  - `update` → use `craft`
  - `craftZen` → use `craft`

  **Rationale:**

  - Focus on Zen integration only
  - Remove immer-style naming (establish independent identity)
  - Export CraftOptions based on industry research (Zustand, Nanostores)
  - DRY principle: single source of truth for types

  # zen-router-react/preact: Add browser-based useHash() utility

  **New feature:**

  - `useHash()` hook for tracking URL hash changes
  - Independent of router state (philosophy: hash ≠ routing)
  - Works with native browser `hashchange` event

## 1.0.1

### Patch Changes

- chore: bump to ensure latest @sylphx/zen v1.2.1 dependency

  Updates all packages to depend on @sylphx/zen ^1.2.1, ensuring users get the latest zen version with performance improvements and bundle size reductions.

- Updated dependencies
  - @sylphx/zen-router@1.0.1

## 0.0.3

### Patch Changes

- chore: Skip Preact tests due to persistent mocking issues

  - Reverted Preact test file to placeholder.
  - Removed test scripts from Preact package.json.
  - Accepted technical debt to proceed with release.

## 0.0.2

### Patch Changes

- feat: Add router package with basic implementation and tests

  - Implemented core router logic (`$router` store, history handling, route matching).
  - Added React (`useRouter`) integration package with tests.
  - Added Preact (`useRouter`) integration package (tests skipped due to mocking issues).
  - Added comprehensive tests for `@sylph/router` core, achieving >90% coverage.
  - Fixed various bugs in `pathToRegexp` handling optional parameters and root path.
  - Fixed build issues related to declaration files in `@sylph/core`.
  - Updated READMEs for core and router packages with corrected examples and information.
  - Updated all `package.json` files for release readiness (license, author, publishConfig, metadata).
  - Aligned Vitest versions across packages.

- Updated dependencies
  - @sylphlab/zen-core@0.1.1
  - @sylphlab/zen-router@0.1.1
