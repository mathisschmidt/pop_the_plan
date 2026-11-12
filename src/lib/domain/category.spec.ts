import { describe, expect, it } from 'vitest';
import { countLabel, isCategory, parseCategories } from './category';

describe('isCategory', () => {
	it('knows every deck', () => {
		for (const c of ['ring', 'dress', 'shoes']) expect(isCategory(c)).toBe(true);
		expect(isCategory('hat')).toBe(false);
		expect(isCategory(null)).toBe(false);
	});
});

describe('parseCategories', () => {
	it('drops unknown values and duplicates, in canonical order', () => {
		expect(parseCategories(['shoes', 'hat', 'ring', 'shoes', 42])).toEqual(['ring', 'shoes']);
		expect(parseCategories([])).toEqual([]);
	});
});

describe('countLabel', () => {
	it('uses the singular and plural units', () => {
		expect(countLabel('ring', 1)).toBe('1 ring');
		expect(countLabel('dress', 3)).toBe('3 dresses');
		expect(countLabel('shoes', 2)).toBe('2 pairs');
		expect(countLabel('shoes', 0)).toBe('0 pairs');
	});
});
