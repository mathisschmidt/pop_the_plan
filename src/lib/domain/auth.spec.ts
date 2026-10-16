import { describe, expect, it } from 'vitest';
import { normalizeGuestCode } from './auth';

describe('normalizeGuestCode', () => {
	it('ignores case, accents, punctuation and spacing', () => {
		expect(normalizeGuestCode('  Café   de Flore! ')).toBe('cafe de flore');
		expect(normalizeGuestCode("L'été 2019")).toBe('l ete 2019');
	});

	it('keeps different codes different', () => {
		expect(normalizeGuestCode('paris')).not.toBe(normalizeGuestCode('pariss'));
	});
});
