import type { Cookies } from '@sveltejs/kit';
import { isCategory, type Category } from '#lib/domain/category.ts';

/**
 * The deck the admin is working on (Overview, Gallery, Add all follow it).
 * A per-device preference: losing it only brings the admin back to the ring deck.
 */
export const WORKING_DECK_COOKIE = 'ptp_deck';

const DEFAULT_DECK: Category = 'ring';

export function readWorkingDeck(cookies: Cookies): Category {
	const value = cookies.get(WORKING_DECK_COOKIE);
	return isCategory(value) ? value : DEFAULT_DECK;
}

export function setWorkingDeck(cookies: Cookies, origin: string, deck: Category): void {
	cookies.set(WORKING_DECK_COOKIE, deck, {
		path: '/admin',
		httpOnly: true,
		sameSite: 'lax',
		secure: origin.startsWith('https:'),
		maxAge: 60 * 60 * 24 * 365
	});
}

/** Where to go back after switching: only an admin page of this app (no open redirect). */
export function safeAdminPath(value: unknown): string {
	if (typeof value !== 'string' || value.startsWith('//') || value.includes('\\')) return '/admin';
	return value === '/admin' || value.startsWith('/admin/') || value.startsWith('/admin?')
		? value
		: '/admin';
}
