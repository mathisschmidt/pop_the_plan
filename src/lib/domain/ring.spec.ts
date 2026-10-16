import { describe, expect, it } from 'vitest';
import { REASON_MAX_LENGTH, isRingStatus, parseVerdictInput } from './ring';

describe('parseVerdictInput', () => {
	it('accepts like and dislike without reason', () => {
		expect(parseVerdictInput('like', 'ignored')).toEqual({
			ok: true,
			value: { verdict: 'like', reason: null }
		});
		expect(parseVerdictInput('dislike', undefined)).toEqual({
			ok: true,
			value: { verdict: 'dislike', reason: null }
		});
	});

	it('requires a trimmed reason for maybe', () => {
		expect(parseVerdictInput('maybe', '   ').ok).toBe(false);
		expect(parseVerdictInput('maybe', ' stone too big ')).toEqual({
			ok: true,
			value: { verdict: 'maybe', reason: 'stone too big' }
		});
	});

	it('rejects overly long reasons', () => {
		expect(parseVerdictInput('maybe', 'x'.repeat(REASON_MAX_LENGTH + 1)).ok).toBe(false);
	});

	it('rejects unknown verdicts', () => {
		expect(parseVerdictInput('pending', null).ok).toBe(false);
		expect(parseVerdictInput(42, null).ok).toBe(false);
	});
});

describe('isRingStatus', () => {
	it('knows pending and every verdict', () => {
		for (const s of ['pending', 'like', 'dislike', 'maybe']) expect(isRingStatus(s)).toBe(true);
		expect(isRingStatus('nope')).toBe(false);
	});
});
