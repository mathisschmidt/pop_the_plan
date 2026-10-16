import type { Cookies } from '@sveltejs/kit';
import type { Session } from './session-service';

export const SESSION_COOKIE = 'ptp_session';

/**
 * `Secure` only when the app is really served over HTTPS (per the public origin).
 * SvelteKit's default would also set it on plain-HTTP LAN addresses (http://192.168.x.x),
 * where browsers then silently drop the cookie and login "does nothing".
 */
const baseOptions = (origin: string) => ({
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: origin.startsWith('https:')
});

export function setSessionCookie(
	cookies: Cookies,
	origin: string,
	token: string,
	session: Session
): void {
	cookies.set(SESSION_COOKIE, token, { ...baseOptions(origin), expires: session.expiresAt });
}

export function clearSessionCookie(cookies: Cookies, origin: string): void {
	cookies.delete(SESSION_COOKIE, baseOptions(origin));
}
