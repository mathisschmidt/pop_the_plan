import { describe, expect, it } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
	it('blocks after max hits and frees the key after the window', () => {
		let now = 0;
		const limiter = new RateLimiter(2, 1000, () => now);

		expect(limiter.hit('ip')).toBe(0);
		expect(limiter.hit('ip')).toBe(0);
		expect(limiter.hit('ip')).toBe(1000);
		expect(limiter.hit('other')).toBe(0);

		now = 1000;
		expect(limiter.hit('ip')).toBe(0);
	});

	it('can be reset after a successful login', () => {
		const limiter = new RateLimiter(1, 1000, () => 0);
		limiter.hit('ip');
		limiter.reset('ip');
		expect(limiter.hit('ip')).toBe(0);
	});
});
