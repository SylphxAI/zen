// Export public API

// Types
export type { Patch, CraftOptions, CraftResult } from './types';

// Low-level API: Transform plain objects/arrays immutably
export { produce as craft } from './produce';

// Patch application (RFC 6902 JSON Patch standard)
export { applyPatches } from './patch';

// Primary API: Update Zen stores with draft-style mutations
export { craftZen as update } from './zen';

// Re-export nothing symbol for property deletion
export { nothing } from '@sylphx/craft';

// Backward compatibility (deprecated, will be removed in v2.0)
/** @deprecated Use `craft` instead. Will be removed in v2.0 */
export { produce } from './produce';
/** @deprecated Use `update` instead. Will be removed in v2.0 */
export { craftZen } from './zen';

// Note: Internal utilities from utils.ts are not exported
