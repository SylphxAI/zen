# 010. Remove @zen/zen in Favor of Platform-Specific Packages

**Status:** ✅ Accepted
**Date:** 2024-11-21

## Context

The `@zen/zen` package was initially created as a convenience wrapper that re-exported `@zen/web`. However, this created confusion about Zen's multi-platform architecture:

1. **Naming confusion**: The name `@zen/zen` suggested it represented the entire Zen framework, but it only provided the web renderer
2. **Multiple import paths**: Users could get the web renderer from either `@zen/zen` or `@zen/web`, creating inconsistency
3. **Unclear platform story**: With TUI and Native renderers now available/planned, the existence of `@zen/zen` obscured the platform-specific nature of renderers
4. **Poor discoverability**: New users weren't immediately aware that Zen supports multiple platforms

## Decision

Remove `@zen/zen` package entirely and require explicit platform package imports:
- `@zen/web` for web applications
- `@zen/tui` for terminal/CLI applications
- `@zen/native` for mobile applications (coming soon)

## Rationale

**Clarity and Explicitness:**
- Package name directly indicates target platform
- No ambiguity about which renderer you're using
- Clear mental model: one package per platform

**Better Tree-Shaking:**
- Users only install dependencies for their target platform
- No unnecessary dependencies bundled
- Smaller production bundles

**Industry Standard:**
- Follows React (`react-dom`, `react-native`)
- Follows Vue (`@vue/runtime-dom`, `@vue/runtime-core`)
- Follows Solid (`solid-js/web`, `solid-js/store`)
- Familiar pattern for developers

**Architectural Alignment:**
- Reflects the layered architecture (Signal → Runtime → Platform Renderer)
- Makes cross-platform capabilities discoverable
- Encourages platform-specific optimizations

## Alternatives Considered

### Option A: Make @zen/zen a True Meta Package
Export all platforms from `@zen/zen`:
```ts
export * from '@zen/web';
export * from '@zen/tui';
export * from '@zen/native';
```

**Rejected because:**
- Large bundle size (includes all platforms)
- Poor tree-shaking (hard to eliminate unused platforms)
- Naming still confusing (why `@zen/zen` instead of just platform packages?)
- Users must understand which exports come from which platform

### Option B: Keep Current Structure
Maintain `@zen/zen` as alias to `@zen/web`.

**Rejected because:**
- Doesn't solve naming confusion
- Doesn't make multi-platform story clear
- Two ways to import same functionality
- Inconsistent with platform packages (`@zen/tui`, `@zen/native`)

## Implementation

Since the package was never published, we removed it entirely rather than deprecating:

1. **Delete package**: Remove `packages/zen/` directory
2. **Update documentation**: Show platform-specific imports in all examples
3. **Update internal code**: Migrate website to use `@zen/web`
4. **Update architecture docs**: Remove references to `@zen/zen`

## Consequences

**Positive:**
- ✅ Clear, explicit platform selection
- ✅ Better tree-shaking and bundle sizes
- ✅ Discoverable multi-platform support
- ✅ Industry-standard pattern
- ✅ Encourages platform-specific optimizations

**Negative:**
- ❌ Slightly longer import paths (`@zen/web` vs `@zen/zen`)
- ❌ Need to update all documentation and examples

**Note:**
- No breaking change since package was never published
- Direct removal cleaner than deprecation

## References

- Implementation: `packages/zen-web/`, `packages/zen-tui/`
- Related: ADR-009 (Cross-Platform Architecture)
