import { describe, expect, it } from 'vitest';
import { safeAdminPath } from './working-deck';

describe('safeAdminPath', () => {
	it('keeps admin pages, with their query', () => {
		expect(safeAdminPath('/admin')).toBe('/admin');
		expect(safeAdminPath('/admin/rings?status=maybe')).toBe('/admin/rings?status=maybe');
		expect(safeAdminPath('/admin?x=1')).toBe('/admin?x=1');
	});

	it('falls back to the overview for anything else', () => {
		for (const value of [
			null,
			'',
			'https://evil.example/admin',
			'//evil.example/admin',
			'/\\evil.example',
			'/swipe',
			'/administrator'
		]) {
			expect(safeAdminPath(value)).toBe('/admin');
		}
	});
});
