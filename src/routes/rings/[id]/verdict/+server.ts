import { error, json } from '@sveltejs/kit';
import { parseVerdictInput } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (locals.session?.role !== 'guest') error(403, 'Only she can decide');

	const body = await request.json().catch(() => null);
	const parsed = parseVerdictInput(body?.verdict, body?.reason);
	if (!parsed.ok) error(400, parsed.error);

	const { rings } = await getServices();
	if (!rings.decide(params.id, parsed.value)) error(409, 'This ring was already decided');

	return json({ ok: true });
};
