import { error, redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { authorize } from '#lib/server/auth/access.ts';
import { SESSION_COOKIE, clearSessionCookie } from '#lib/server/auth/cookies.ts';
import { getServices } from '#lib/server/container.ts';
import { isCrossSiteRequest } from '#lib/server/security/csrf.ts';

const SECURITY_HEADERS = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'same-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	const { sessions, origin } = await getServices();
	event.locals.origin = origin ?? event.url.origin;

	const crossSite = isCrossSiteRequest({
		method: event.request.method,
		originHeader: event.request.headers.get('origin'),
		expectedOrigin: event.locals.origin
	});
	if (crossSite) error(403, 'Cross-site request blocked. Is ORIGIN set to the URL you are using?');

	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.session = token ? sessions.validate(token) : null;
	if (token && !event.locals.session) clearSessionCookie(event.cookies, event.locals.origin);

	const access = authorize(event.url.pathname, event.locals.session?.role ?? null);
	if (!access.allowed) {
		const isPageNavigation =
			event.request.method === 'GET' && !event.url.pathname.startsWith('/media/');
		if (isPageNavigation) redirect(303, access.loginPath);
		error(401, 'Please sign in');
	}

	const response = await resolve(event);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
	return response;
};
