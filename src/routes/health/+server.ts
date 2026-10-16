import { text } from '@sveltejs/kit';
import { getServices } from '#lib/server/container.ts';
import type { RequestHandler } from './$types';

/** Liveness probe for Docker / reverse proxies. Fails if the database cannot be opened. */
export const GET: RequestHandler = async () => {
	await getServices();
	return text('ok', { headers: { 'Cache-Control': 'no-store' } });
};
