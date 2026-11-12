import { describe, expect, it } from 'vitest';
import { swipeIntent, swipeProgress } from './swipe';

describe('swipeIntent', () => {
	it('stays undecided under the threshold', () => {
		expect(swipeIntent(50, 40)).toBeNull();
	});

	it('detects horizontal swipes', () => {
		expect(swipeIntent(150, 20)).toBe('right');
		expect(swipeIntent(-150, 20)).toBe('left');
	});

	it('detects a downward swipe when it dominates', () => {
		expect(swipeIntent(30, 150)).toBe('down');
		expect(swipeIntent(200, 150)).toBe('right');
	});

	it('ignores upward drags', () => {
		expect(swipeIntent(0, -300)).toBeNull();
	});
});

describe('swipeProgress', () => {
	it('is clamped and exclusive between axes', () => {
		expect(swipeProgress(50, 0)).toEqual({ right: 0.5, left: 0, down: 0 });
		expect(swipeProgress(10, 400)).toEqual({ right: 0, left: 0, down: 1 });
	});
});
