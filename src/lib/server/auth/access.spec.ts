import { describe, expect, it } from 'vitest';
import { authorize, homePath } from './access';

describe('authorize', () => {
	it('keeps login pages public', () => {
		expect(authorize('/login', null)).toEqual({ allowed: true });
		expect(authorize('/admin/login', null)).toEqual({ allowed: true });
	});

	it('restricts the admin area to the admin', () => {
		expect(authorize('/admin', null)).toEqual({ allowed: false, loginPath: '/admin/login' });
		expect(authorize('/admin/rings', 'guest')).toEqual({
			allowed: false,
			loginPath: '/admin/login'
		});
		expect(authorize('/admin/rings', 'admin')).toEqual({ allowed: true });
		expect(authorize('/admin/deck', 'guest')).toEqual({
			allowed: false,
			loginPath: '/admin/login'
		});
	});

	it('lets both roles see the decks and media', () => {
		expect(authorize('/swipe', 'guest')).toEqual({ allowed: true });
		expect(authorize('/swipe/dress', 'admin')).toEqual({ allowed: true });
		expect(authorize('/swipe/verdict/abc', 'guest')).toEqual({ allowed: true });
		expect(authorize('/rings', 'guest')).toEqual({ allowed: true });
		expect(authorize('/media/rings/abc', 'admin')).toEqual({ allowed: true });
		expect(authorize('/media/rings/abc', null)).toEqual({ allowed: false, loginPath: '/login' });
	});

	it('sends signed-out visitors of the decks to her login', () => {
		expect(authorize('/swipe', null)).toEqual({ allowed: false, loginPath: '/login' });
		expect(authorize('/swipe/shoes', null)).toEqual({ allowed: false, loginPath: '/login' });
		expect(authorize('/swipe/verdict/abc', null)).toEqual({ allowed: false, loginPath: '/login' });
		expect(authorize('/rings', null)).toEqual({ allowed: false, loginPath: '/login' });
	});

	it('does not match on partial segments', () => {
		expect(authorize('/administrator', null)).toEqual({ allowed: true });
	});
});

describe('homePath', () => {
	it('routes each role to its home', () => {
		expect(homePath('admin')).toBe('/admin');
		expect(homePath('guest')).toBe('/swipe');
		expect(homePath(null)).toBe('/login');
	});
});
