import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, clearSessionCookie } from '#lib/server/auth/cookies.ts';
import { getServices } from '#lib/server/container.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	const role = locals.session?.role;
	if (locals.session) (await getServices()).sessions.invalidate(locals.session.id);
	if (cookies.get(SESSION_COOKIE)) clearSessionCookie(cookies, locals.origin);
	redirect(303, role === 'admin' ? '/admin/login' : '/login');
};
