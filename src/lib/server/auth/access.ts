import type { Role } from '#lib/domain/auth.ts';

/**
 * Central route access policy. Enforced in `hooks.server.ts` so it covers pages,
 * form actions and endpoints alike (layout `load` guards do NOT protect actions).
 */
type Rule = { prefix: string; roles: readonly Role[] | 'public'; loginPath: string };

// First match wins: keep the most specific prefixes first.
const RULES: readonly Rule[] = [
	{ prefix: '/admin/login', roles: 'public', loginPath: '/admin/login' },
	{ prefix: '/admin', roles: ['admin'], loginPath: '/admin/login' },
	{ prefix: '/rings', roles: ['guest', 'admin'], loginPath: '/login' },
	{ prefix: '/media', roles: ['guest', 'admin'], loginPath: '/login' }
];

export type AccessDecision = { allowed: true } | { allowed: false; loginPath: string };

const matches = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export function authorize(pathname: string, role: Role | null): AccessDecision {
	const rule = RULES.find((r) => matches(pathname, r.prefix));
	if (!rule || rule.roles === 'public') return { allowed: true };
	if (role && rule.roles.includes(role)) return { allowed: true };
	return { allowed: false, loginPath: rule.loginPath };
}

/** Where a signed-in user lands. */
export function homePath(role: Role | null): string {
	if (role === 'admin') return '/admin';
	if (role === 'guest') return '/rings';
	return '/login';
}
