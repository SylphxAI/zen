/**
 * Fair Performance Benchmark: Testing built dist files (not source)
 *
 * This tests the actual production builds that users will consume.
 */

import { bench, describe } from 'vitest';

// Import from DIST (built files)
import * as StandardZen from '../dist/index.js';
import * as OptimizedZen from '../dist/optimized/zen-optimized.js';
import * as UltraZen from '../dist/ultra/zen-ultra.js';

describe('Dist Builds - Signal Operations', () => {
	bench('Standard: zen create + read', () => {
		const count = StandardZen.zen(0);
		const _ = count.value;
	});

	bench('Optimized: zen create + read', () => {
		const count = OptimizedZen.zen(0);
		const _ = count.value;
	});

	bench('Ultra: zen create + read', () => {
		const count = UltraZen.zen(0);
		const _ = count.value;
	});
});

describe('Dist Builds - Computed (1 dep)', () => {
	bench('Standard: computed (1 dep)', () => {
		const a = StandardZen.zen(1);
		const doubled = StandardZen.computed([a], (v) => v * 2);
		a.value = 2;
		const _ = doubled.value;
	});

	bench('Optimized: computed (1 dep)', () => {
		const a = OptimizedZen.zen(1);
		const doubled = OptimizedZen.computed([a], (v) => v * 2);
		a.value = 2;
		const _ = doubled.value;
	});

	bench('Ultra: computed (1 dep) - Explicit', () => {
		const a = UltraZen.zen(1);
		const doubled = UltraZen.computed(() => a.value * 2, [a]);
		a.value = 2;
		const _ = doubled.value;
	});

	bench('Ultra: computed (1 dep) - Auto-tracking', () => {
		const a = UltraZen.zen(1);
		const doubled = UltraZen.computed(() => a.value * 2);
		a.value = 2;
		const _ = doubled.value;
	});
});

describe('Dist Builds - Computed (3 deps)', () => {
	bench('Standard: computed (3 deps)', () => {
		const a = StandardZen.zen(1);
		const b = StandardZen.zen(2);
		const c = StandardZen.zen(3);
		const sum = StandardZen.computed([a, b, c], (av, bv, cv) => av + bv + cv);
		a.value = 2;
		const _ = sum.value;
	});

	bench('Optimized: computed (3 deps)', () => {
		const a = OptimizedZen.zen(1);
		const b = OptimizedZen.zen(2);
		const c = OptimizedZen.zen(3);
		const sum = OptimizedZen.computed([a, b, c], (av, bv, cv) => av + bv + cv);
		a.value = 2;
		const _ = sum.value;
	});

	bench('Ultra: computed (3 deps) - Explicit', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.zen(2);
		const c = UltraZen.zen(3);
		const sum = UltraZen.computed(() => a.value + b.value + c.value, [a, b, c]);
		a.value = 2;
		const _ = sum.value;
	});

	bench('Ultra: computed (3 deps) - Auto-tracking', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.zen(2);
		const c = UltraZen.zen(3);
		const sum = UltraZen.computed(() => a.value + b.value + c.value);
		a.value = 2;
		const _ = sum.value;
	});
});

describe('Dist Builds - Deep Chain (5 levels)', () => {
	bench('Standard: computed chain', () => {
		const a = StandardZen.zen(1);
		const b = StandardZen.computed([a], (v) => v * 2);
		const c = StandardZen.computed([b], (v) => v * 2);
		const d = StandardZen.computed([c], (v) => v * 2);
		const e = StandardZen.computed([d], (v) => v * 2);
		a.value = 2;
		const _ = e.value;
	});

	bench('Optimized: computed chain', () => {
		const a = OptimizedZen.zen(1);
		const b = OptimizedZen.computed([a], (v) => v * 2);
		const c = OptimizedZen.computed([b], (v) => v * 2);
		const d = OptimizedZen.computed([c], (v) => v * 2);
		const e = OptimizedZen.computed([d], (v) => v * 2);
		a.value = 2;
		const _ = e.value;
	});

	bench('Ultra: computed chain - Explicit', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.computed(() => a.value * 2, [a]);
		const c = UltraZen.computed(() => b.value * 2, [b]);
		const d = UltraZen.computed(() => c.value * 2, [c]);
		const e = UltraZen.computed(() => d.value * 2, [d]);
		a.value = 2;
		const _ = e.value;
	});

	bench('Ultra: computed chain - Auto-tracking', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.computed(() => a.value * 2);
		const c = UltraZen.computed(() => b.value * 2);
		const d = UltraZen.computed(() => c.value * 2);
		const e = UltraZen.computed(() => d.value * 2);
		a.value = 2;
		const _ = e.value;
	});
});

describe('Dist Builds - Diamond Graph', () => {
	bench('Standard: diamond graph', () => {
		const a = StandardZen.zen(1);
		const b = StandardZen.computed([a], (v) => v * 2);
		const c = StandardZen.computed([a], (v) => v * 3);
		const d = StandardZen.computed([b, c], (bv, cv) => bv + cv);
		a.value = 5;
		const _ = d.value;
	});

	bench('Optimized: diamond graph', () => {
		const a = OptimizedZen.zen(1);
		const b = OptimizedZen.computed([a], (v) => v * 2);
		const c = OptimizedZen.computed([a], (v) => v * 3);
		const d = OptimizedZen.computed([b, c], (bv, cv) => bv + cv);
		a.value = 5;
		const _ = d.value;
	});

	bench('Ultra: diamond graph - Explicit', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.computed(() => a.value * 2, [a]);
		const c = UltraZen.computed(() => a.value * 3, [a]);
		const d = UltraZen.computed(() => b.value + c.value, [b, c]);
		a.value = 5;
		const _ = d.value;
	});

	bench('Ultra: diamond graph - Auto-tracking', () => {
		const a = UltraZen.zen(1);
		const b = UltraZen.computed(() => a.value * 2);
		const c = UltraZen.computed(() => a.value * 3);
		const d = UltraZen.computed(() => b.value + c.value);
		a.value = 5;
		const _ = d.value;
	});
});

describe('Dist Builds - Subscriptions', () => {
	bench('Standard: subscribe + notify', () => {
		const count = StandardZen.zen(0);
		let _value = 0;
		const unsub = StandardZen.subscribe(count, (v) => {
			_value = v;
		});
		count.value = 1;
		unsub();
	});

	bench('Optimized: subscribe + notify', () => {
		const count = OptimizedZen.zen(0);
		let _value = 0;
		const unsub = OptimizedZen.subscribe(count, (v) => {
			_value = v;
		});
		count.value = 1;
		unsub();
	});

	bench('Ultra: subscribe + notify', () => {
		const count = UltraZen.zen(0);
		let _value = 0;
		const unsub = UltraZen.subscribe(count, (v) => {
			_value = v;
		});
		count.value = 1;
		unsub();
	});
});

describe('Dist Builds - Batch Updates', () => {
	bench('Standard: batch 10 updates', () => {
		const count = StandardZen.zen(0);
		let _value = 0;
		StandardZen.subscribe(count, (v) => {
			_value = v;
		});
		StandardZen.batch(() => {
			for (let i = 0; i < 10; i++) {
				count.value = i;
			}
		});
	});

	bench('Optimized: batch 10 updates', () => {
		const count = OptimizedZen.zen(0);
		let _value = 0;
		OptimizedZen.subscribe(count, (v) => {
			_value = v;
		});
		OptimizedZen.batch(() => {
			for (let i = 0; i < 10; i++) {
				count.value = i;
			}
		});
	});

	bench('Ultra: batch 10 updates', () => {
		const count = UltraZen.zen(0);
		let _value = 0;
		UltraZen.subscribe(count, (v) => {
			_value = v;
		});
		UltraZen.batch(() => {
			for (let i = 0; i < 10; i++) {
				count.value = i;
			}
		});
	});
});

describe('Dist Builds - Conditional Dependencies', () => {
	bench('Ultra: conditional - Explicit (over-subscribe)', () => {
		const useA = UltraZen.zen(true);
		const a = UltraZen.zen(1);
		const b = UltraZen.zen(2);
		const result = UltraZen.computed(() => useA.value ? a.value : b.value, [useA, a, b]);

		a.value = 10;
		const _ = result.value;
		b.value = 20; // Wasteful: triggers even though not used
		const __ = result.value;
	});

	bench('Ultra: conditional - Auto-tracking (optimal)', () => {
		const useA = UltraZen.zen(true);
		const a = UltraZen.zen(1);
		const b = UltraZen.zen(2);
		const result = UltraZen.computed(() => useA.value ? a.value : b.value);

		a.value = 10;
		const _ = result.value;
		b.value = 20; // Optimal: doesn't trigger
		const __ = result.value;
	});
});

describe('Dist Builds - Real-world: Counter App', () => {
	bench('Standard: counter app', () => {
		const count = StandardZen.zen(0);
		const doubled = StandardZen.computed([count], (v) => v * 2);
		const tripled = StandardZen.computed([count], (v) => v * 3);
		const sum = StandardZen.computed([doubled, tripled], (d, t) => d + t);

		let result = 0;
		StandardZen.subscribe(sum, (v) => { result = v; });

		count.value = 1;
		count.value = 2;
		count.value = 3;
	});

	bench('Optimized: counter app', () => {
		const count = OptimizedZen.zen(0);
		const doubled = OptimizedZen.computed([count], (v) => v * 2);
		const tripled = OptimizedZen.computed([count], (v) => v * 3);
		const sum = OptimizedZen.computed([doubled, tripled], (d, t) => d + t);

		let result = 0;
		OptimizedZen.subscribe(sum, (v) => { result = v; });

		count.value = 1;
		count.value = 2;
		count.value = 3;
	});

	bench('Ultra: counter app - Auto-tracking', () => {
		const count = UltraZen.zen(0);
		const doubled = UltraZen.computed(() => count.value * 2);
		const tripled = UltraZen.computed(() => count.value * 3);
		const sum = UltraZen.computed(() => doubled.value + tripled.value);

		let result = 0;
		UltraZen.subscribe(sum, (v) => { result = v; });

		count.value = 1;
		count.value = 2;
		count.value = 3;
	});
});

describe('Dist Builds - Real-world: Form Validation', () => {
	bench('Standard: form validation', () => {
		const email = StandardZen.zen('');
		const password = StandardZen.zen('');
		const confirmPassword = StandardZen.zen('');

		const emailValid = StandardZen.computed(
			[email],
			(e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
		);
		const passwordValid = StandardZen.computed(
			[password],
			(p) => p.length >= 8
		);
		const passwordsMatch = StandardZen.computed(
			[password, confirmPassword],
			(p, c) => p === c
		);
		const formValid = StandardZen.computed(
			[emailValid, passwordValid, passwordsMatch],
			(e, p, m) => e && p && m
		);

		email.value = 'test@example.com';
		password.value = 'password123';
		confirmPassword.value = 'password123';
		const _ = formValid.value;
	});

	bench('Optimized: form validation', () => {
		const email = OptimizedZen.zen('');
		const password = OptimizedZen.zen('');
		const confirmPassword = OptimizedZen.zen('');

		const emailValid = OptimizedZen.computed(
			[email],
			(e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
		);
		const passwordValid = OptimizedZen.computed(
			[password],
			(p) => p.length >= 8
		);
		const passwordsMatch = OptimizedZen.computed(
			[password, confirmPassword],
			(p, c) => p === c
		);
		const formValid = OptimizedZen.computed(
			[emailValid, passwordValid, passwordsMatch],
			(e, p, m) => e && p && m
		);

		email.value = 'test@example.com';
		password.value = 'password123';
		confirmPassword.value = 'password123';
		const _ = formValid.value;
	});

	bench('Ultra: form validation - Auto-tracking', () => {
		const email = UltraZen.zen('');
		const password = UltraZen.zen('');
		const confirmPassword = UltraZen.zen('');

		const emailValid = UltraZen.computed(
			() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
		);
		const passwordValid = UltraZen.computed(
			() => password.value.length >= 8
		);
		const passwordsMatch = UltraZen.computed(
			() => password.value === confirmPassword.value
		);
		const formValid = UltraZen.computed(
			() => emailValid.value && passwordValid.value && passwordsMatch.value
		);

		email.value = 'test@example.com';
		password.value = 'password123';
		confirmPassword.value = 'password123';
		const _ = formValid.value;
	});
});
