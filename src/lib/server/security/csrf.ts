/**
 * Cross-site request forgery guard, enforced in `hooks.server.ts`.
 *
 * SvelteKit's built-in check needs the public origin at *build* time (`paths.origin`), and
 * adapter-node otherwise assumes `https`. That cannot work for a Docker image configured at
 * runtime (e.g. served on http://192.168.1.20:3000), so the built-in check is disabled in
 * vite.config.ts and replaced by this one, which compares against the runtime ORIGIN.
 *
 * Stricter than the built-in one: every state-changing request is checked, whatever its
 * content type (forms and JSON alike). Browsers always send `Origin` on such requests.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isCrossSiteRequest(input: {
	method: string;
	originHeader: string | null;
	expectedOrigin: string;
}): boolean {
	if (SAFE_METHODS.has(input.method)) return false;
	return input.originHeader !== input.expectedOrigin;
}

/** Normalises a configured origin (`https://pop.example.com/` -> `https://pop.example.com`). */
export function parseOrigin(value: string): string {
	const url = new URL(value);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('ORIGIN must start with http:// or https://');
	}
	return url.origin;
}
