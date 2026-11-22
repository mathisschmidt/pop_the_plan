import { describe, expect, it } from 'vitest';
import {
	LINK_MAX_LENGTH,
	REASON_MAX_LENGTH,
	isRingStatus,
	parseLink,
	parseVerdictInput
} from './ring';

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

describe('parseLink', () => {
	it('treats an empty value as no link', () => {
		expect(parseLink('')).toEqual({ ok: true, value: null });
		expect(parseLink('   ')).toEqual({ ok: true, value: null });
		expect(parseLink(null)).toEqual({ ok: true, value: null });
	});

	it('keeps http(s) links, trimmed', () => {
		expect(parseLink(' https://shop.example/gift?id=1 ')).toEqual({
			ok: true,
			value: 'https://shop.example/gift?id=1'
		});
		expect(parseLink('http://shop.example/')).toMatchObject({ ok: true });
	});

	it('refuses other schemes, garbage and very long links', () => {
		expect(parseLink('javascript:alert(1)')).toMatchObject({ ok: false });
		expect(parseLink('not a link')).toMatchObject({ ok: false });
		expect(parseLink(`https://a.example/${'x'.repeat(LINK_MAX_LENGTH)}`)).toMatchObject({
			ok: false
		});
	});
});
