import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Role } from '#lib/domain/auth.ts';
import type { Services } from '../container';
import { homePath } from './access';
import { setSessionCookie } from './cookies';

/**
 * Shared flow for both login forms: rate limit -> verify -> open session -> redirect.
 * Returns a `fail()` for the form, or throws the redirect on success.
 */
export async function login(
	event: RequestEvent,
	services: Services,
	role: Role,
	verify: () => Promise<boolean>
) {
	const limiterKey = `${role}:${event.getClientAddress()}`;
	const waitMs = services.loginLimiter.hit(limiterKey);
	if (waitMs > 0) {
		const minutes = Math.ceil(waitMs / 60_000);
		return fail(429, { error: `Too many tries. Take a breath and retry in ${minutes} min.` });
	}

	if (!(await verify())) {
		return fail(400, { error: role === 'admin' ? 'Wrong password' : 'Not quite… try again' });
	}

	services.loginLimiter.reset(limiterKey);
	const { token, session } = services.sessions.create(role);
	setSessionCookie(event.cookies, event.locals.origin, token, session);
	redirect(303, homePath(role));
}
