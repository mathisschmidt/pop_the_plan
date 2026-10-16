import { describe, expect, it } from 'vitest';
import { isCrossSiteRequest, parseOrigin } from './csrf';

const expectedOrigin = 'http://192.168.1.20:3000';

describe('isCrossSiteRequest', () => {
	it('lets safe methods through', () => {
		expect(isCrossSiteRequest({ method: 'GET', originHeader: null, expectedOrigin })).toBe(false);
	});

	it('accepts state-changing requests from our origin only', () => {
		expect(
			isCrossSiteRequest({ method: 'POST', originHeader: expectedOrigin, expectedOrigin })
		).toBe(false);
		expect(
			isCrossSiteRequest({ method: 'POST', originHeader: 'https://evil.example', expectedOrigin })
		).toBe(true);
		expect(isCrossSiteRequest({ method: 'DELETE', originHeader: null, expectedOrigin })).toBe(true);
	});

	it('treats a scheme or port mismatch as cross-site', () => {
		expect(
			isCrossSiteRequest({
				method: 'POST',
				originHeader: 'https://192.168.1.20:3000',
				expectedOrigin
			})
		).toBe(true);
	});
});

describe('parseOrigin', () => {
	it('normalises to scheme://host[:port]', () => {
		expect(parseOrigin('https://pop.example.com/')).toBe('https://pop.example.com');
		expect(parseOrigin('http://192.168.1.20:3000/admin')).toBe('http://192.168.1.20:3000');
	});

	it('rejects non-http values', () => {
		expect(() => parseOrigin('pop.example.com')).toThrow();
		expect(() => parseOrigin('ftp://pop.example.com')).toThrow();
	});
});
